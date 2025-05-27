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
    
    // ユーザーが所有するプランのみ削除できるようにする
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }
    
    // 削除対象のプランが実際にユーザーのものであるか確認
    const userPlans = await prisma.plan.findMany({
      where: {
        id: { in: selectedItems },
        userId: user.id
      },
      select: {
        id: true
      }
    });
    
    // ユーザー所有のプランIDのみを抽出
    const userPlanIds = userPlans.map(plan => plan.id);
    
    if (userPlanIds.length === 0) {
      return NextResponse.json({ message: '削除対象のプランが見つかりませんでした' }, { status: 404 });
    }
    
    // プランに関連するPlanItemsを削除
    // Prismaの削除はカスケード設定されているのでプランを削除すればPlanItemも削除されます
    
    // プランの削除
    const deletedPlans = await prisma.plan.deleteMany({
      where: {
        id: { in: userPlanIds }
      }
    });
    
    return NextResponse.json({ 
      message: `${deletedPlans.count}件のプランを削除しました`,
      deletedCount: deletedPlans.count,
      deletedIds: userPlanIds
    });
    
  } catch (error) {
    console.error('プラン削除エラー:', error);
    return NextResponse.json({ message: 'プラン削除中にエラーが発生しました' }, { status: 500 });
  }
}