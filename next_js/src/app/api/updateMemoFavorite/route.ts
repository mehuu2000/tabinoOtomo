import { NextResponse } from 'next/server';
import  prisma  from '../../lib/prisma';

export async function POST(request: Request) {
    try {
      const { selectedItems } = await request.json();  // フロントエンドから送信されたデータを受け取る
  
      if (!selectedItems || selectedItems.length === 0) {
        return NextResponse.json({ message: "選択されたアイテムがありません" }, { status: 400 });
      }
  
      const memos = await prisma.memo.findMany({
        where: {
          id: { in: selectedItems },
        },
        select: {
          id: true,
          favorite: true,
        },
      });
  
      const updatedMemosPromises = memos.map((memo) => {
        return prisma.memo.update({
          where: { id: memo.id },
          data: {
            favorite: !memo.favorite,
          },
        });
      });
  
      // 全ての更新処理を非同期に実行
      const updatedMemos = await Promise.all(updatedMemosPromises);
  
      return NextResponse.json({ message: `${updatedMemos.length} 件のメモがお気に入りに登録/非登録にされました` });
  
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "エラーが発生しました" }, { status: 500 });
    }
  }