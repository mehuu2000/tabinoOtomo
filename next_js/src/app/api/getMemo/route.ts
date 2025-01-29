import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export async function POST(req: NextRequest) {
    try {
        // リクエストボディを取得
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            throw new Error('userIdが必要です');
        }

        // Prismaを使用して、該当ユーザーのメモを取得
        const memos = await prisma.memo.findMany({
            where: { userId },
            include: { items: true }, // MemoItemも取得
        });

        // 成功レスポンスを返す
        return NextResponse.json({ success: true, memos });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'fetchできませんでした' }, { status: 500 });
    }
}