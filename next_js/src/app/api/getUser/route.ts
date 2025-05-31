import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurentUser';

// GET メソッドに対応するエクスポート
export const GET = async () => {
  try {
    const currentUser = await getCurrentUser();
    console.log(`取得したもの：${JSON.stringify(currentUser)}`); // オブジェクトをJSONとして表示

    if (!currentUser) {
      return NextResponse.json({ message: 'ユーザー情報の取得に失敗しました' }, { status: 404 });
    }

    return NextResponse.json(currentUser, { status: 200 });
  } catch (error) {
    console.error('エラーログ:', error); // エラーログを確認
    return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
  }
};
