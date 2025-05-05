import { supabase } from '../lib/spabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base64画像をSupabaseストレージにアップロードする関数
 * @param base64Image Base64エンコードされた画像データ(geminiで生成したデータ)
 * @param bucket ストレージバケット名（投稿画像:postImages, プロフィール画像:profileImages）
 * @param folder 保存先フォルダ（オプション）
 * @returns アップロードされた画像のURL、失敗時はnull
 */
export async function uploadImageToSupabase(
  base64Image: string,
  bucket: 'spot-images' | 'profile-images' = 'spot-images', // バケット名を更新
  folder = ''  // フォルダ名を指定しない
): Promise<string | null> {  // 返り値の型を更新
  try {
    // Base64形式のチェック
    if (!base64Image || !base64Image.includes('base64')) {
      console.error('base64形式の画像データではありません');
      return null;
    }

    // MIMEタイプ取得(例 "data:image/png;base64," のような形式)
    const mimeTypeMatch = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (!mimeTypeMatch) {
      console.error('MIMEタイプの取得に失敗しました');
      return null;
    }
    
    const mimeType = mimeTypeMatch[1];  // MIMEタイプを取得、例：'image/png'
    const fileExt = mimeType.split('/')[1];  // 拡張子を取得、例：'png'
    
    // Base64データからヘッダーを削除
    const base64Data = base64Image.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
    
    // Base64をBlobに変換
    const blob = await fetch(`data:${mimeType};base64,${base64Data}`).then(res => res.blob());
    
    // ファイル名を生成
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;  //フォルダ名があれば追加
    
    // Supabaseにアップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error(`Supabase storage upload error (bucket: ${bucket}):`, error);
      return null;
    }
    
    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
      
    return publicUrl;
    
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}