import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keyValue = searchParams.get("keyName");
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = 10; // 1ページあたりのスポット数
        const skip = (page - 1) * pageSize; // スポットのスキップ数

        const selectFields = {
            id: true,
            prectures: true,
            name: true,
            description: true,
            imageUrl: true,
            updatedAt: true,
        };

        let spots;
        let totalCount = 0;

        // keyValueがない場合は、全てのスポットを取得(20件ずつでページネーション)
        if(!keyValue) {
            totalCount = await prisma.spot.count();

            spots = await prisma.spot.findMany({
                take: pageSize,
                skip: skip,
                orderBy: {
                    id: "asc",
                },
                select: selectFields,
            })

            return NextResponse.json({
                spots: spots,
                pagination: {
                    total: totalCount,
                    pageSize: pageSize,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / pageSize),
                }
            })
        } else if(keyValue) {
            // keyValueがある場合は、一致するスポットを取得
            totalCount = await prisma.spot.count({
                where: {
                    OR: [
                        { name: { contains: keyValue } },
                        { prectures: { contains: keyValue } },
                    ]
                }
            });

            spots = await prisma.spot.findMany({
                where: {
                    OR: [
                        { name: { contains: keyValue } },
                        { prectures: { contains: keyValue } },
                    ]
                },
                take: pageSize,
                skip: skip,
                orderBy: {
                    id: "asc",
                },
                select: selectFields,
            });

            return NextResponse.json({
                spots: spots,
                pagination: {
                    total: totalCount,
                    pageSize: pageSize,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
            })
        } else {
            return NextResponse.json({ message : "スポットが見つかりませんでした" }, { status: 404 });
        }
    } catch (error) {
        console.error("スポット取得中にエラーが発生しました:", error);
        return NextResponse.json({ 
            message: "スポット取得中にエラーが発生しました", 
            error: error 
        }, { status: 500 });
    }
}
