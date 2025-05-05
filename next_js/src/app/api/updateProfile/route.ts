import { NextResponse } from 'next/server';
import prisma from '../../../app/lib/prisma';

export async function PUT(req: Request) {
    try {
        // リクエストからデータを取得
        const { submitImage, submitName, submitIntro, userId } = await req.json();

        // Prisma を使ってユーザー情報を更新
        const updatedUser = await prisma.user.update({
            where: {
                id: userId, // userIdを使用してユーザーを特定
            },
            //中身を見て、nullでなければ値を更新、nullなら更新しない(prisma.updateはundifinedのものを更新しない)
            data: {
                image: submitImage !== null ? submitImage : undefined,
                name: submitName !== null ? submitName : undefined,
                intro: submitIntro !== null ? submitIntro : undefined,
            },
        });

        // 成功レスポンスを返す
        return NextResponse.json({ updatedUser }, { status: 200 });
    } catch (error) {
        // エラーハンドリング
        console.error(error);
        return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
    }
}