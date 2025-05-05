import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

// リクエストボディの型定義
interface CreateSpotRequest {
  prefectureName: string;
  spotName: string;
  description: string;
  imageUrl: string;
}

export async function POST(requeest: Request) {
    try {
        const { prefectureName, spotName, description, imageUrl } = await requeest.json() as CreateSpotRequest;

        const nweSpot = await prisma.spot.create({
            data: {
                prectures: prefectureName,
                name: spotName,
                description: description,
                imageUrl: imageUrl,
            },
        })

        if (!nweSpot) {
            return NextResponse.json({ message: 'スポットの作成に失敗しました' }, { status: 500 });
        }

        return NextResponse.json({ message: 'スポットが作成されました' }, { status: 200 });

    } catch (error) {
        console.error('スポットの作成中にエラーが発生しました:', error);
        return NextResponse.json({ message: 'スポットの作成中にエラーが発生しました' }, { status: 500 });
    }
}