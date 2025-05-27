import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
    
    // プランの訪問状態を取得
    const plans = await prisma.plan.findMany({
      where: {
        id: { in: selectedItems },
        userId: user.id
      },
      select: {
        id: true,
        visited: true
      }
    });
    
    // 更新結果を格納
    const updateResults = [];
    
    // 各プランの訪問状態を反転
    for (const plan of plans) {
      const updated = await prisma.plan.update({
        where: { id: plan.id },
        data: {
          visited: !plan.visited,
          updatedAt: new Date()
        }
      });
      
      updateResults.push({
        id: updated.id,
        visited: updated.visited
      });
    }
    
    // 更新されたプランが1つでもあれば成功
    if (updateResults.length > 0) {
      // すべてのプランの訪問状態が同じか確認（追加か解除か判断のため）
      const allVisited = updateResults.every(result => result.visited === true);
      const allUnvisited = updateResults.every(result => result.visited === false);
      
      let message = '';
      if (allVisited) {
        message = 'プランを訪問済みに設定しました';
      } else if (allUnvisited) {
        message = 'プランの訪問済み設定を解除しました';
      } else {
        message = 'プランの訪問状態を更新しました';
      }
      
      return NextResponse.json({ 
        message, 
        updatedPlans: updateResults,
        isAdded: allVisited
      });
    } else {
      return NextResponse.json({ message: '更新対象のプランが見つかりませんでした' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('訪問状態更新エラー:', error);
    return NextResponse.json({ message: '訪問状態更新中にエラーが発生しました' }, { status: 500 });
  }
}