from flask import Flask, request, Response
from flask_cors import CORS
import paramiko
import json
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

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
    
    
@app.route('/aiSearchRank', methods=['POST'])
def ai_search_rank():
    print("AI検索・ランキングの処理を受け付けました")
    
    data = request.json
    spots = data.get('spots', [])
    query = data.get('query', '')
    
    if not query or not spots:
        return {'error': '検索クエリまたはスポット情報がありません', 'rankedIds': []}, 400
    
    print(f"検索クエリ: {query}")
    print(f"ランキング対象スポット: {len(spots)}件")
    
    # スポットIDと名前のマッピングを保存（デバッグ用）
    spot_names = {spot['id']: spot['name'] for spot in spots}
    
    # SSH接続してFastAPIの一括処理エンドポイントを呼び出す
    try:
        # SSH接続を確立
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh_client.connect(ssh_host, port=ssh_port, username=ssh_username, key_filename=ssh_key_path)
        
        # JSONデータを直接指定
        json_data = json.dumps({
            "spots": spots,
            "query": query
        }, ensure_ascii=False)
        
        # エスケープ処理を行う（特に引用符）
        escaped_json = json_data.replace('"', '\\"')
        
        # FastAPIにリクエストを送るコマンド（JSONを直接指定）
        command = f'curl -X POST http://127.0.0.1:8000/ai_search_rank -H "Content-Type: application/json" -d "{escaped_json}"'
        
        stdin, stdout, stderr = ssh_client.exec_command(command)
        result = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        print("FastAPIからの応答受信")
        
        if error:
            print("エラー出力:")
            print(error)
        
        # SSH接続を閉じる
        ssh_client.close()
        
        try:
            # FastAPIのレスポンスをJSONとしてパース
            fastapi_response = json.loads(result)
            
            if 'rankedIds' in fastapi_response:
                ranked_ids = fastapi_response['rankedIds']
                print("\n===== ランキング結果の詳細 =====")
                print(f"検索クエリ: 「{query}」")
                print(f"ランキング結果件数: {len(ranked_ids)}件")
                print("-" * 50)
                
                # 上位20件のランキング結果を表示
                for i, spot_id in enumerate(ranked_ids[:20]):
                    spot_name = spot_names.get(spot_id, "不明なスポット")
                    print(f"{i+1}位: ID={spot_id}, 名前={spot_name}")
                
                if len(ranked_ids) > 20:
                    print(f"...他 {len(ranked_ids)-20} 件")
                print("=" * 50)
            
            return fastapi_response, 200
            
        except json.JSONDecodeError as json_err:
            print(f"FastAPIからのレスポンスのJSONパースに失敗: {json_err}")
            print(f"受信したレスポンス: {result}")
            return {'error': 'AI検索結果の解析に失敗しました', 'rankedIds': []}, 500
    
    except Exception as e:
        import traceback
        print(f"AI検索でエラーが発生しました: {e}")
        print(traceback.format_exc())  # スタックトレースを出力
        return {'error': f'AI検索処理に失敗しました: {str(e)}', 'rankedIds': []}, 500
    
    
@app.route('/chatAi', methods=['POST'])
def chat_ai():
    print("AIチャットの処理を受け付けました")
    
    data = request.json
    message = data.get('message', '')
    previous_messages = data.get('previousMessages', [])
    
    if not message:
        return {'error': 'メッセージが指定されていません', 'response': ''}, 400
    
    print(f"ユーザーメッセージ: {message}")
    print(f"過去のメッセージ数: {len(previous_messages)}件")
    
    # SSH接続してFastAPIのチャットエンドポイントを呼び出す
    try:
        # SSH接続を確立
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh_client.connect(ssh_host, port=ssh_port, username=ssh_username, key_filename=ssh_key_path)
        
        # JSONデータを準備
        json_data = json.dumps({
            "message": message,
            "previous_messages": previous_messages
        }, ensure_ascii=False)
        
        # エスケープ処理を行う（特に引用符）
        escaped_json = json_data.replace('"', '\\"')
        
        # FastAPIにリクエストを送るコマンド
        command = f'curl -X POST http://127.0.0.1:8000/chat -H "Content-Type: application/json" -d "{escaped_json}"'
        
        print("AIサーバーにリクエスト送信中...")
        stdin, stdout, stderr = ssh_client.exec_command(command)
        result = stdout.read().decode('utf-8')
        error = stderr.read().decode('utf-8')
        
        print("AIサーバーからの応答受信")
        
        if error:
            print("エラー出力:")
            print(error)
        
        # SSH接続を閉じる
        ssh_client.close()
        
        try:
            # FastAPIのレスポンスをJSONとしてパース
            ai_response = json.loads(result)
            
            print("AIの回答:", ai_response.get('response', '')[:100] + "...")  # 回答の先頭部分のみ表示
            
            return ai_response, 200
            
        except json.JSONDecodeError as json_err:
            print(f"AIサーバーからのレスポンスのJSONパースに失敗: {json_err}")
            print(f"受信したレスポンス: {result}")
            return {'error': 'AIレスポンスの解析に失敗しました', 'response': ''}, 500
    
    except Exception as e:
        import traceback
        print(f"AIチャット処理でエラーが発生しました: {e}")
        print(traceback.format_exc())
        return {'error': f'AIチャット処理に失敗しました: {str(e)}', 'response': ''}, 500
    


if __name__ == '__main__':
    app.debug = True
    app.run()