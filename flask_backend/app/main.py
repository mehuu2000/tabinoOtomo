from flask import Flask, request, Response
from flask_cors import CORS
import paramiko
import json
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

load_dotenv()

# SSH接続の設定
ssh_host = os.getenv('SSH_HOST')  # SSH接続先のUbuntuサーバーのIP
ssh_port = int(os.getenv('SSH_PORT'))  # ポート番号
ssh_username = os.getenv('SSH_USERNAME')  # ユーザー名
ssh_key_path = os.getenv('SSH_PRIVATE_KEY_PATH')  # 秘密鍵のパス 

@app.route('/makeTabi', methods=['POST'])
def makeTabi():
    print("作成の処理を受け付けました")
    
    data = request.json  # フロントから送られたJSONデータ
    prefectures = data.get('prefectures', [])
    number = data.get('number', 0)
    
    print(f"選択された都道府県: {prefectures}")
    print(f"作成数: {number}")
    
    # SSH接続してFastAPIを呼び出す
    try:
        # SSH接続を確立
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())  # 新しいホストキーを自動で追加
        ssh_client.connect(ssh_host, port=ssh_port, username=ssh_username, key_filename=ssh_key_path)
        
        # JSONデータをcurlで送信
        json_data = json.dumps({
            "prefectures": prefectures,
            "number": number
        })
        
        # FastAPIにリクエストを送るコマンドを実行
        command = f'curl -X POST http://127.0.0.1:8000/makeTabi -H "Content-Type: application/json" -d \'{json_data}\''
        
        stdin, stdout, stderr = ssh_client.exec_command(command)
        result = stdout.read().decode('utf-8')  # 実行結果を取得
        
        print("FastAPIからの応答:")
        print(result)
        
        # SSH接続を閉じる
        ssh_client.close()
        
        # 重要な変更: FastAPIからの結果をパースしてから返す
        try:
            # FastAPIのレスポンスをJSONとしてパース
            fastapi_response = json.loads(result)
            
            # そのままの構造で返す（二重のラップを避ける）
            return fastapi_response, 200
            
        except json.JSONDecodeError as json_err:
            print(f"FastAPIからのレスポンスのJSONパースに失敗: {json_err}")
            print(f"受信したレスポンス: {result}")
            return {'error': 'FastAPIからのレスポンスの解析に失敗しました', 'raw_response': result}, 500
    
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return {'error': 'SSH接続またはFastAPIの呼び出しに失敗しました'}, 500

@app.route('/make_image', methods=['POST'])
def make_image():
    print("画像生成の処理を受け付けました")
    
    data = request.json  # フロントから送られたJSONデータ
    prompt = data.get('prompt', '')
    
    if not prompt:
        return {'error': 'プロンプトが指定されていません'}, 400
    
    print(f"画像生成プロンプト: {prompt}")
    
    # SSH接続して画像生成APIを呼び出す
    try:
        # SSH接続を確立
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh_client.connect(ssh_host, port=ssh_port, username=ssh_username, key_filename=ssh_key_path)
        
        # JSONデータを準備
        json_data = json.dumps({
            "prompt": prompt
        })
        
        # FastAPIにリクエストを送るコマンドを実行
        # -o オプションを使って応答を一時ファイルに保存
        temp_file = f"/tmp/image_{os.urandom(4).hex()}.png"
        
        # リクエストを送信し、レスポンスを画像ファイルとして保存
        print("curlコマンドを実行中...")
        command = f'curl -X POST http://127.0.0.1:8000/make_sample_image -H "Content-Type: application/json" -d \'{json_data}\' --output {temp_file}'
        
        print(f"実行コマンド: {command}")
        stdin, stdout, stderr = ssh_client.exec_command(command)
        
        # コマンドの完了を待つ
        exit_code = stdout.channel.recv_exit_status()
        
        if exit_code != 0:
            error_msg = stderr.read().decode('utf-8')
            print(f"curlコマンドエラー: {error_msg}")
            return {'error': f'画像生成リクエストに失敗しました: {error_msg}'}, 500
        
        # SFTPセッションを開始
        sftp = ssh_client.open_sftp()
        
        # ファイルが存在するか確認
        try:
            file_stat = sftp.stat(temp_file)
            print(f"画像ファイルサイズ: {file_stat.st_size} バイト")
            
            if file_stat.st_size == 0:
                return {'error': '生成された画像ファイルが空です'}, 500
                
        except FileNotFoundError:
            return {'error': '画像ファイルが見つかりませんでした'}, 500
        
        # ローカルの一時ファイルパス
        local_temp_file = f"/tmp/local_image_{os.urandom(4).hex()}.png"
        
        # リモートからローカルに画像をダウンロード
        sftp.get(temp_file, local_temp_file)
        
        # 画像データを読み込む
        with open(local_temp_file, 'rb') as f:
            image_data = f.read()
        
        # ローカルとリモートの一時ファイルを削除
        os.unlink(local_temp_file)
        sftp.unlink(temp_file)
        
        # SFTP接続とSSH接続を閉じる
        sftp.close()
        ssh_client.close()
        
        # 画像データを直接返す
        return Response(
            image_data,
            mimetype='image/png'
        )
        
    except Exception as e:
        import traceback
        print(f"画像生成中にエラーが発生しました: {str(e)}")
        print(traceback.format_exc())
        return {'error': f'画像生成処理でエラーが発生しました: {str(e)}'}, 500

if __name__ == '__main__':
    app.debug = True
    app.run()