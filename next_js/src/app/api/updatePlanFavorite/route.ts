import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma'; // Prismaクライアントのインポート
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // セッションからユーザーを取得
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: '認証されていません' }, { status: 401 });
    }
    
    // リクエストボディを取得
    const body = await request.json();
    const { selectedItems } = body;
    
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return NextResponse.json({ message: '無効なリクエストです' }, { status: 400 });
    }
    
    // ユーザーが所有するプランのみ更新できるようにする
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }
    
    // プランのお気に入り状態を取得
    const plans = await prisma.plan.findMany({
      where: {
        id: { in: selectedItems },
        userId: user.id
      },
      select: {
        id: true,
        favorite: true
      }
    });
    
    // 更新結果を格納
    const updateResults = [];
    
    // 各プランのお気に入り状態を反転
    for (const plan of plans) {
      const updated = await prisma.plan.update({
        where: { id: plan.id },
        data: {
          favorite: !plan.favorite,
          updatedAt: new Date()
        }
      });
      
      updateResults.push({
        id: updated.id,
        favorite: updated.favorite
      });
    }
    
    // 更新されたプランが1つでもあれば成功
    if (updateResults.length > 0) {
      // すべてのプランのお気に入り状態が同じか確認（追加か解除か判断のため）
      const allAdded = updateResults.every(result => result.favorite === true);
      const allRemoved = updateResults.every(result => result.favorite === false);
      
      let message = '';
      if (allAdded) {
        message = 'プランをお気に入りに追加しました';
      } else if (allRemoved) {
        message = 'プランをお気に入りから解除しました';
      } else {
        message = 'プランのお気に入り状態を更新しました';
      }
      
      return NextResponse.json({ 
        message, 
        updatedPlans: updateResults,
        isAdded: allAdded
      });
    } else {
      return NextResponse.json({ message: '更新対象のプランが見つかりませんでした' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('お気に入り更新エラー:', error);
    return NextResponse.json({ message: 'お気に入り更新中にエラーが発生しました' }, { status: 500 });
  }
}