from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from io import BytesIO
import uvicorn
import requests
import json
import re

app = FastAPI()

class TabiRequest(BaseModel):
    prefectures: List[str]  # 都道府県のリスト
    number: int  # 作成数

class TouristSpot(BaseModel):
    name: str
    description: str

class PrefectureSpots(BaseModel):
    prefecture: str
    spots: List[TouristSpot]
    
class SearchRankRequest(BaseModel):
    spots: List[Dict[str, Any]]
    query: str

class SearchRankResponse(BaseModel):
    rankedIds: List[int]
    
# チャットリクエストのモデル
class ChatRequest(BaseModel):
    message: str
    previous_messages: Optional[List[Dict[str, Any]]] = []

# チャットレスポンスのモデル
class ChatResponse(BaseModel):
    response: str
    
    
@app.post("/ai_search_rank", response_model=SearchRankResponse)
async def ai_search_rank(request_data: dict):
    try:
        request = SearchRankRequest(**request_data)
        
        spots = request.spots
        query = request.query
        
        print(f"AI検索ランキングリクエスト: クエリ='{query}', スポット数={len(spots)}")
        
        if not spots:
            return {"rankedIds": []}

        # キーワード抽出処理
        keywords = await extract_keywords(query)
        
        # キーワードを含むスポットでフィルタリング
        filtered_spots = []
        for spot in spots:
            score = 0
            # クエリ全体が含まれているかチェック
            if query.lower() in spot['name'].lower() or query.lower() in spot['description'].lower():
                score += 5
            
            # 抽出キーワードが含まれているかチェック
            for keyword in keywords:
                if keyword.lower() in spot['name'].lower():
                    score += 3
                if keyword.lower() in spot['description'].lower():
                    score += 2
                if keyword.lower() in spot['prectures'].lower():
                    score += 1
            
            # 最低限のスコアがあるか、上位100件に入るなら追加
            if score > 0 or len(filtered_spots) < 100:
                filtered_spots.append((spot, score))
        
        # スコアでフィルタリングしたスポットを並び替え
        filtered_spots.sort(key=lambda x: x[1], reverse=True)
        top_spots = [spot for spot, _ in filtered_spots[:100]]  # 上位100件のみ
        
        print(f"フィルタリング後のスポット数: {len(top_spots)}")
        
        # データ量に応じて処理を分割
        if len(top_spots) > 30:
            chunks = [top_spots[i:i+30] for i in range(0, len(top_spots), 30)]
            ranked_ids = []
            for i, chunk in enumerate(chunks):
                print(f"チャンク {i+1}/{len(chunks)} を処理中...")
                chunk_ids = await rank_spots_with_ai(chunk, query, keywords)
                ranked_ids.extend(chunk_ids)
        else:
            ranked_ids = await rank_spots_with_ai(top_spots, query, keywords)
        
        print(f"ランキング結果: {len(ranked_ids)}件")
        print(f"ランキングされたスポットID: {ranked_ids}")
        return {"rankedIds": ranked_ids}
        
    except Exception as e:
        print(f"AI検索ランキングエラー: {e}")
        raise HTTPException(status_code=500, detail=f"AI検索処理中にエラーが発生しました: {str(e)}")

# キーワード抽出関数
async def extract_keywords(query: str) -> List[str]:
    try:
        # プロンプトの作成
        prompt = f"""あなたは旅行スポット検索の専門家です。
以下の旅行関連の検索クエリからキーワードを5つ程度抽出してください。
キーワードはカンマ区切りで出力してください。

検索クエリ: {query}

例) キーワード：夏,海,ビーチ,リゾート,家族旅行
"""

        # LLaMA APIを呼び出す
        llama_response = requests.post(
            "http://localhost:8080/completion",
            headers={"Content-Type": "application/json"},
            json={
                "prompt": prompt,
                "max_tokens": 100
            },
            timeout=30
        )
        
        # APIのレスポンスをJSONとして解析
        llama_data = llama_response.json()
        result = llama_data.get("content", "")
        print(f"キーワード抽出の生の出力結果: {result}")
        print("")
        
        # 余分なテキストを削除
        # すべての特殊トークンを削除
        result = re.sub(r'<[^>]+>', '', result)  # すべてのHTMLタグ風の特殊トークン削除
        result = result.replace("</think>", "").replace("\"\"\"", "").strip()
        
        # LLMの出力パターンを認識するための追加処理
        # 出力の最初の行だけをキーワードとして使用するケース
        first_line = result.split('\n')[0].strip()
        if first_line and (',' in first_line or '、' in first_line) and not first_line.startswith('キーワード'):
            if not first_line.startswith("例") and not first_line.startswith("出力例"):
                extracted_line = first_line
                print(f"最初の行をキーワードとして使用: {extracted_line}")
                # カンマまたは読点で分割して早期リターン
                words = [w.strip() for w in re.split(r'[,、]', extracted_line) if w.strip()]
                if words:
                    cleaned_keywords = []
                    for keyword in words:
                        cleaned = re.sub(r'[`*_]', '', keyword).strip()
                        if cleaned:
                            cleaned_keywords.append(cleaned)
                    if cleaned_keywords:
                        print(f"抽出されたキーワード: {cleaned_keywords}")
                        return cleaned_keywords
        
        # キーワードを抽出するための正規表現パターン
        keyword_patterns = [
            r'キーワード[:：]([^。\n]+)',  # 「キーワード:」または「キーワード：」の後に続く文字
            r'キーワード[はが]([^。\n]+)',  # 「キーワードは」「キーワードが」の後に続く文字
            r'([^。\n,、]{2,}[,、][^。\n,、]{2,}[,、][^。\n]+)'  # カンマか読点で区切られた複数の単語
        ]
        
        extracted_line = ""
        # パターンを順に試して最初に一致するものを使用
        for pattern in keyword_patterns:
            for line in result.split('\n'):
                match = re.search(pattern, line)
                if match:
                    extracted_line = match.group(1).strip()
                    break
            if extracted_line:
                break
        
        # パターンで抽出できなかった場合は、最も可能性の高い行を使用
        if not extracted_line:
            lines = [line.strip() for line in result.split('\n') if line.strip()]
            for line in lines:
                if ',' in line or '、' in line:
                    # カンマまたは読点を含む最初の行を使用
                    if not line.startswith("例") and not line.startswith("出力例"):
                        extracted_line = line
                        break
        
        # カンマまたは読点で分割
        keywords = []
        if extracted_line:
            words = [w.strip() for w in re.split(r'[,、]', extracted_line) if w.strip()]
            keywords.extend(words)
        
        # コード記号や特殊トークンを削除
        cleaned_keywords = []
        for keyword in keywords:
            # マークダウン記号と特殊トークンを削除
            cleaned = re.sub(r'[`*_]', '', keyword).strip()
            # 空でなければ追加
            if cleaned:
                cleaned_keywords.append(cleaned)
        
        # キーワードがなければクエリ自体を使用
        if not cleaned_keywords:
            print(f"有効なキーワードが抽出できなかったため、クエリ全体をキーワードとして使用: {query}")
            return [query]
            
        print(f"抽出されたキーワード: {cleaned_keywords}")
        print("")
        return cleaned_keywords
        
    except Exception as e:
        print(f"キーワード抽出エラー: {e}")
        return [query]  # エラー時はクエリ自体をキーワードとして返す

# AIランキング関数
async def rank_spots_with_ai(spots: List[Dict[str, Any]], query: str, keywords) -> List[int]:
    print(f"AIランキング処理開始: スポット数={len(spots)}, クエリ='{query}', キーワード={keywords}")
    try:
        # スポット情報をテキスト形式に整形
        spots_text = ""
        for i, spot in enumerate(spots):
            spots_text += f"{i+1}. 名前: {spot['name']}, 場所: {spot['prectures']}, "
            description = spot['description'][:150] + "..." if len(spot['description']) > 150 else spot['description']
            spots_text += f"説明: {description}\n"
        
        # プロンプトの作成
        prompt = f"""あなたは旅行プランナーです。ユーザーの検索条件に最も合った旅行先を選んでください。

次の検索条件に対して、最も関連性の高い順に観光スポットを並べ替えて、番号を返してください。

検索条件: {query}
キーワード: {', '.join(keywords)}


観光スポット:
{spots_text}

結果は{len(spots)}個の数字のみをカンマ区切りで出力してください。
例) 3,1,5,2,4,6
"""

        print(f"AIランキングプロンプト: {prompt}")
        # LLaMA APIを呼び出す
        llama_response = requests.post(
            "http://localhost:8080/completion",
            headers={"Content-Type": "application/json"},
            json={
                "prompt": prompt,
                "max_tokens": 1000
            },
            timeout=60
        )
        
        # APIのレスポンスをJSONとして解析
        llama_data = llama_response.json()
        result = llama_data.get("content", "")
        
        # 余分なテキストを削除
        result = result.replace("<｜end▁of▁sentence｜>", "").strip()
        
        print(f"AIランキング結果: {result}")
        
        # 数字だけを抽出
        ranking_numbers = [int(num) for num in re.findall(r'\d+', result)]
        
        # 有効なインデックスだけを使用（1-based → 0-based）
        valid_rankings = []
        seen = set()
        for num in ranking_numbers:
            idx = num - 1
            if 0 <= idx < len(spots) and idx not in seen:
                seen.add(idx)
                valid_rankings.append(idx)
        
        # ランキング順にスポットIDを返す
        ranked_ids = [spots[idx]['id'] for idx in valid_rankings]
        
        # ランキングに含まれなかったスポットも末尾に追加（順不同）
        remaining_ids = []
        for i, spot in enumerate(spots):
            if i not in valid_rankings:
                remaining_ids.append(spot['id'])
        
        ranked_ids.extend(remaining_ids)
        
        return ranked_ids
        
    except Exception as e:
        print(f"ランキングエラー: {e}")
        # エラーの場合は元のIDリストを返す
        return [spot['id'] for spot in spots]
    
    
    

@app.get("/test")
def read_root():
    return {"message": "Hello, World Mac User!"}

def parse_ai_response(text: str) -> List[Dict[str, Any]]:
    """AIの応答を構造化データに変換する関数（直接dict形式で返す）"""
    lines = text.split('\n')
    prefecture_spots_list = []
    
    current_prefecture = None
    current_spots = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 都道府県の行を検出
        if line.startswith('# '):
            # 前の都道府県のデータがあれば保存
            if current_prefecture and current_spots:
                prefecture_spots_list.append({
                    "prefecture": current_prefecture,
                    "spots": current_spots.copy()
                })
                current_spots = []
                
            # 新しい都道府県を設定
            current_prefecture = line[2:].strip()
            
        # 観光スポットの行を検出
        elif current_prefecture and re.match(r'^\d+\.', line):
            # 番号とスポット名、説明を分離
            match = re.match(r'^\d+\.\s*([^:]+):(.*)', line)
            if match:
                name = match.group(1).strip()
                description = match.group(2).strip()
                current_spots.append({
                    "name": name,
                    "description": description
                })
    
    # 最後の都道府県のデータも追加
    if current_prefecture and current_spots:
        prefecture_spots_list.append({
            "prefecture": current_prefecture,
            "spots": current_spots.copy()
        })
    
    return prefecture_spots_list

@app.post("/makeTabi")
async def make_tabi(request: TabiRequest):
    prefectures = request.prefectures  # 都道府県のリスト
    number = request.number  # 作成数
    
    # 選択された都道府県がない場合はエラーを返す
    if not prefectures:
        raise HTTPException(status_code=400, detail="都道府県を少なくとも1つ選択してください")
    
    # プロンプトの作成 - 複数の都道府県にも対応
    prompt = f"""以下の都道府県それぞれについて、有名な観光スポットを正確に{number}個ずつ紹介してください。
選択された都道府県: {', '.join(prefectures)}

以下の形式で回答してください:
# 都道府県名
1. 観光スポット名: 視覚的特徴を含む具体的な説明（ビジュアル要素を強調）
2. 観光スポット名: 視覚的特徴を含む具体的な説明（ビジュアル要素を強調）
{'' if number <= 2 else '3. 観光スポット名: 視覚的特徴を含む具体的な説明（ビジュアル要素を強調）'}
{'' if number <= 3 else '...etc'}

例を示します：
# 石川県
1. 瀬加名の滝: 滝の高さ約50メートル、透明な水が悬崖から奔流し、周りには緑深い山々がそそり立つ。四季折々の風景を楽しめるが、特に紅葉シーズンは圧巻。
2. 石川県立美術館: 白い外壁と円形の設計が特徴的な建物。周囲には広い庭園があり、春には桜が咲き乱れ、秋には紅葉が鮮やかな景観を作り出す。
{'' if number <= 2 else '3. 観光スポット名: 視覚的特徴を含む具体的な説明（ビジュアル要素を強調）'}
{'' if number <= 3 else '...etc'}

重要なルール:
- 各都道府県につき、正確に{number}個の観光スポットを紹介すること
- 観光スポットは実在する有名な場所を選ぶこと
- 各スポットの説明には以下の視覚的特徴を必ず含めること:
  * 建物・景観の色や形状
  * 特徴的な自然環境（山、海、湖など）
  * 季節の特徴（桜、紅葉、雪景色など該当する場合）
- 観光スポットが重複しないようにすること
- 各都道府県は見出し(#)で区切ること
"""
    
    try:
        print(f"プロンプト: {prompt}")
        # LLaMA APIを呼び出す
        llama_response = requests.post(
            "http://localhost:8080/completion",
            headers={"Content-Type": "application/json"},
            json={
                "prompt": prompt,
                # "max_tokens": 2000  # 十分な長さに設定
            },
            timeout=90  # タイムアウトも適切に設定
        )
        
        # APIのレスポンスをJSONとして解析
        llama_data = llama_response.json()
        
        # contentフィールドからテキストを抽出
        if "content" in llama_data:
            ai_text = llama_data["content"]
            
            # 余分なテキストを削除する処理
            
            # 1. `</think>` タグで分割し、最後の部分を取得
            if "</think>" in ai_text:
                parts = ai_text.split("</think>")
                ai_text = parts[-1].strip()
            
            # 2. コードブロック記号(```)を探して内部のテキストだけを抽出
            if "```" in ai_text:
                # コードブロック内のテキストを抽出
                blocks = ai_text.split("```")
                # コードブロックは通常、奇数番目の要素（インデックス1, 3, ...）に含まれる
                for i in range(1, len(blocks), 2):
                    if i < len(blocks):
                        ai_text = blocks[i].strip()
                        break
            
            # 3. その他の不要なタグや指示を削除
            ai_text = ai_text.replace("<｜end▁of▁sentence｜>", "")
            ai_text = ai_text.replace("- 日本語での説明にする", "")
            ai_text = ai_text.replace("- 簡潔にまとめる", "")
            ai_text = ai_text.replace("以上の形式に従い、教えてください。", "")
            
            # 4. 行頭の空白行を削除
            ai_text = ai_text.lstrip("\n")
            
            # 5. 各スポットが必要な数だけ存在することを確認する処理
            processed_text_lines = []
            current_prefecture = None
            spot_count = 0
            
            for line in ai_text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                
                # 都道府県の行を検出
                if line.startswith('# '):
                    if current_prefecture:
                        processed_text_lines.append("")  # 都道府県間に空行を追加
                    current_prefecture = line
                    processed_text_lines.append(line)
                    spot_count = 0
                    continue
                
                # 観光スポットの行を検出
                if current_prefecture and re.match(r'^\d+\.', line):
                    spot_count += 1
                    if spot_count <= number:
                        processed_text_lines.append(line)
            
            # 処理後のテキストを結合
            cleaned_text = '\n'.join(processed_text_lines)
            
            # 構造化データに変換（dict形式で取得）
            structured_data = parse_ai_response(cleaned_text)
            
            # デバッグ用に出力
            print(f"選択した都道府県: {', '.join(prefectures)}, 数: {number}")
            print(f"クリーニング後のAIの応答: {cleaned_text}")
            print(f"構造化データ (dict形式): {structured_data}")
            
            # JSONResponseを使って明示的なJSON応答を返す
            # messageフィールドを除外し、structured_dataだけを返す
            return JSONResponse(content={"structured_data": structured_data})
            
        else:
            raise HTTPException(status_code=500, detail="AIからの応答の解析に失敗しました")
        
    except requests.RequestException as e:
        # API呼び出しに失敗した場合
        print(f"LLaMA API呼び出しエラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI APIの呼び出しに失敗しました: {str(e)}")
    
    except Exception as e:
        # その他のエラー
        import traceback
        print(f"予期しないエラー: {str(e)}")
        print(traceback.format_exc())  # スタックトレースを出力
        raise HTTPException(status_code=500, detail=f"サーバーエラー: {str(e)}")
    
class ImageRequest(BaseModel):
    prompt: str

@app.post("/make_sample_image")
async def make_sample_image(request: ImageRequest):
    prompt = request.prompt
    
    try:
        print(f"画像生成プロンプト: {prompt}")
        # 画像生成APIを呼び出す
        image_response = requests.post(
            "http://127.0.0.1:8081/make_image",
            headers={"Content-Type": "application/json"},
            json={"prompt": prompt},
            timeout=120  # 画像生成には時間がかかるため、タイムアウトを長めに設定
        )
        
        if image_response.status_code != 200:
            raise HTTPException(
                status_code=image_response.status_code, 
                detail=f"画像生成APIからエラーが返されました: {image_response.text}"
            )
        
        # 画像データをそのまま返す
        return StreamingResponse(
            BytesIO(image_response.content),
            media_type="image/png"
        )

    except requests.RequestException as e:
        # API呼び出しに失敗した場合
        print(f"画像生成API呼び出しエラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"画像生成APIの呼び出しに失敗しました: {str(e)}")
    
    except Exception as e:
        # その他のエラー
        import traceback
        print(f"予期しないエラー: {str(e)}")
        print(traceback.format_exc())  # スタックトレースを出力
        raise HTTPException(status_code=500, detail=f"サーバーエラー: {str(e)}")
    
    
@app.post("/chat", response_model=ChatResponse)
async def chat(request_data: ChatRequest):
    try:
        message = request_data.message
        previous_messages = request_data.previous_messages
        
        print(f"新しいチャットリクエスト: '{message}'")
        print(f"過去のメッセージ数: {len(previous_messages)}件")
        
        # コンテキストの構築 - より明確な構造に改善
        conversation_history = ""
        if previous_messages:
            for msg in previous_messages[-5:]:  # 直近5件のみ使用
                role = "ユーザー" if msg.get("sender") == "user" else "アシスタント"
                conversation_history += f"{role}: {msg.get('text', '')}\n"
        
        # プロンプトの作成 - 明確な指示と役割定義を追加
        prompt = f"""あなたは自然な会話ができるAIアシスタントです。思考過程や回答の解説は表示せず、説明調ではなく、会話調で直接回答だけを返してください。
指示：
1, 直接回答のみを返す（「〜と回答しました」のような表現は使わない）
2. 解説、分析、引用は一切省く
3. 親しみやすい会話調で返す
4. 回答は日本語で行う

以下は会話の履歴です：
{conversation_history}

今回の質問: {message}

回答："""

        try:
            # DeepSeek LLMに問い合わせ
            llm_response = requests.post(
                "http://localhost:8080/completion",
                headers={"Content-Type": "application/json"},
                json={
                    "prompt": prompt,
                    "max_tokens": 300,
                    "temperature": 0.6,  # 少し下げて一貫性を高める
                    "stop": ["\nユーザー:", "\n回答："]  # 停止ワードを設定
                },
                timeout=30
            )
            
            # レスポンスの確認と解析（変更なし）
            if llm_response.status_code != 200:
                print(f"LLMエラー: ステータスコード {llm_response.status_code}")
                print(f"エラー内容: {llm_response.text}")
                raise HTTPException(status_code=500, detail="言語モデルからの応答エラー")
            
            llm_data = llm_response.json()
            ai_response = llm_data.get("content", "")
            
            # 特殊トークンと余分なテキストの削除
            ai_response = ai_response.replace("<｜end▁of▁sentence｜>", "")
            ai_response = re.sub(r'<[^>]+>', '', ai_response)
            ai_response = re.sub(r'^アシスタント[：:]\s*', '', ai_response)
            
            # 余分な箇条書きやプレフィックスを削除
            ai_response = re.sub(r'^[-*]\s+', '', ai_response)
            
            print(f"AIの応答: {ai_response[:100]}...（一部抜粋）")
            
            return {"response": ai_response.strip()}
            
        except requests.RequestException as e:
            print(f"LLM API呼び出しエラー: {str(e)}")
            raise HTTPException(status_code=500, detail=f"言語モデルAPIの呼び出しに失敗しました: {str(e)}")
        
    except Exception as e:
        import traceback
        print(f"チャット処理中のエラー: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"チャット処理エラー: {str(e)}")




if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)