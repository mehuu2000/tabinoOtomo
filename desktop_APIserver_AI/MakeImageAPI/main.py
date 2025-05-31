from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
import torch
from accelerate import Accelerator
from io import BytesIO
import uvicorn
import time

app = FastAPI()

# 画像生成リクエスト用のモデル
class ImageRequest(BaseModel):
    prompt: str  # 画像生成用のプロンプト

# Acceleratorインスタンスを作成
accelerator = Accelerator()

print("モデルをロード中...")
try:
    pipe = StableDiffusionPipeline.from_pretrained(
        "./stable-diffusion-2-1-base", 
        torch_dtype=torch.float16
    )
except Exception as e:
    print("モデルロードエラー:", e)
    raise e

pipe = pipe.to(accelerator.device)  # Acceleratorが管理するデバイスに移動
pipe.enable_attention_slicing()      # メモリ使用量を削減

print(f"モデルのロード完了。CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"初期GPU Memory: {torch.cuda.memory_allocated() / 1024**2:.2f} MB")

@app.post("/make_image")
async def generate_image(request: ImageRequest):
    original_prompt = request.prompt
    
    # プロンプトを加工して風景のみを生成し、人物を除外する
    # landscape_keywords = "landscape, scenery, nature, beautiful view"
    # negative_prompt = "people, person, human, man, woman, child, portrait, face, body"
    landscape_keywords = "キーワード：landscape, scenery, nature, beautiful view, photorealistic, ultra-detailed, realistic lighting, 8k resolution, DSLR photo"
    negative_prompt = "people, person, human, man, woman, child, portrait, face, body, cartoon, anime, illustration, painting, drawing, sketch, artstation, cgi, 3d render"
    # 要望
    request = "あなたは写真家であり、写真を撮ることのプロです。このプロンプトに基づいて、風景や建物、建造物を中心に写真風に生成してください。特にプロンプトに建物のワードがある場合は必ず建築物を出力すること。また、人物は必要でない限り生成しないでください。"

    
    # 元のプロンプトに風景キーワードを追加
    # prompt = f"{request}{original_prompt}, {landscape_keywords}"
    prompt = f"{request}プロンプト：{original_prompt}, "
    print(f"生成プロンプト: {prompt}")
    
    start_time = time.time()
    
    # GPUメモリ状態のログ（デバッグ用）
    if torch.cuda.is_available():
        print(f"処理前GPU Memory: {torch.cuda.memory_allocated() / 1024**2:.2f} MB")
    
    print(f"画像生成開始: '{prompt}'")
    try:
        with accelerator.autocast():  # 自動混合精度で生成
            image = pipe(
                prompt=prompt, 
                negative_prompt=negative_prompt,
                height=512, 
                width=1024, 
                num_inference_steps=100,
                guidance_scale=7.5
            ).images[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"画像生成中にエラーが発生しました: {e}")
    
    processing_time = time.time() - start_time
    print(f"画像生成完了。処理時間: {processing_time:.2f}秒")
    
    if torch.cuda.is_available():
        print(f"処理後GPU Memory: {torch.cuda.memory_allocated() / 1024**2:.2f} MB")
    
    # 画像をファイルとして保存
    image_io = BytesIO()
    print(f"type(image): {type(image)}")
    print(f"image: {image}")
    try:
        image.save(image_io, format="PNG")
        image_io.seek(0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"画像保存中にエラーが発生しました: {e}")
    
    # 不要になったGPUメモリを解放（オプション）
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    
    return StreamingResponse(image_io, media_type="image/png")

@app.get("/gpu_info")
async def get_gpu_info():
    """GPUの情報を返すエンドポイント"""
    if not torch.cuda.is_available():
        return {"status": "GPU not available"}
    
    return {
        "cuda_available": torch.cuda.is_available(),
        "device_count": torch.cuda.device_count(),
        "current_device": torch.cuda.current_device(),
        "device_name": torch.cuda.get_device_name(0),
        "memory_allocated_mb": torch.cuda.memory_allocated() / 1024**2,
        "memory_reserved_mb": torch.cuda.memory_reserved() / 1024**2
    }

if __name__ == "__main__":
    print("サーバー起動中...")
    uvicorn.run("main:app", host="127.0.0.1", port=8081, reload=False)
