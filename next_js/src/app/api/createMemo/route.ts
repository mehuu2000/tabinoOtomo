import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import { supabase } from '../../lib/spabase';

const BUCKET_NAME = 'image-upload';

type MemoFormItem = {
    type: "text" | "img";
    content: string;
    order: number;
};

type RequestBody = {
    memoTitle: string;
    memoForm: MemoFormItem[];
    userId: string;
};

// class MemoError extends Error {
//     constructor(message: string) {
//         super(message);
//         this.name = 'MemoError';
//     }
// }

// エラーメッセージを取得する関数
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

export async function POST(req: Request) {
    console.log("メモの作成を開始します。api側");

    try {
        const { memoTitle, memoForm, userId } = await req.json() as RequestBody;
        console.log(userId);
        console.log(memoTitle);

        const processedMemoForm = await Promise.all(
            memoForm.map(async (item: MemoFormItem) => {
            if (item.type === 'img' && item.content) {
                // Base64から画像をバイナリデータに変換 (JPEG形式を前提)
                const base64Data = item.content.split(',')[1];
                if (!base64Data) {
                    throw new Error('Invalid image data');
                }
                const buffer = Buffer.from(base64Data, 'base64');

                // ファイル名にタイムスタンプを追加して一意性を確保
                const timestamp = new Date().getTime();
                const fileName = `${timestamp}-${userId}-${item.order}.jpg`;

                // Supabaseストレージにアップロード
                const { error: uploadError } = await supabase
                    .storage
                    .from(BUCKET_NAME)
                    .upload(`images/${fileName}`, buffer, {
                        contentType: 'image/jpeg',
                        upsert: true
                    });

                    if (uploadError) {
                        console.error('Upload error:', uploadError);
                        throw uploadError;
                    }

                // アップロード後、画像のURLを取得
                const { data: signedData, error: signedError } = await supabase
                            .storage
                            .from(BUCKET_NAME)
                            .createSignedUrl(`images/${fileName}`, 31536000); // 1年間有効

                if (signedError || !signedData) {
                    throw new Error('Failed to get signed URL');
                }

                // contentをBase64からURLに更新
                const safeUrl = signedData.signedUrl;

                return {
                    ...item,
                    content: safeUrl
                };
            }

            return item;
        }));

        const memo = await prisma.memo.create({
            data: {
                title: memoTitle || null,
                userId,
                items: {
                    create: processedMemoForm.map(item => ({
                        type: item.type,
                        content: item.content,
                        order: item.order,
                    })),
                },
            },
            include: {
                items: true
            }
        });

        

        return NextResponse.json({ success: true, memo });
    } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        console.error('メモ作成エラー:', errorMessage);
        
        return NextResponse.json(
            { 
                success: false, 
                message: `メモの保存中にエラーが発生しました: ${errorMessage}` 
            }, 
            { status: 500 }
        );
    }
}