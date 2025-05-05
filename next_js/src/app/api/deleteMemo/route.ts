import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { selectedItems } = await request.json();

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return NextResponse.json({ message: '削除対象のメモが選択されていません' }, { status: 400 });
    }

    // データベースからメモを削除
    await prisma.memo.deleteMany({
      where: {
        id: { in: selectedItems },
      },
    });

    return NextResponse.json({ message: `${selectedItems.length} 件のメモが削除されました` });
  } catch (error) {
    console.error('メモ削除エラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}