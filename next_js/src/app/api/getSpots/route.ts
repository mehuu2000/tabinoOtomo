import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keyValue = searchParams.get("keyName");
        const prefecture = searchParams.get("prefecture"); // 追加：都道府県フィルターパラメータ
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

        let whereCondition: Prisma.SpotWhereInput = {};
        
        // キーワード検索条件
        if(keyValue) {
            whereCondition.OR = [
                { name: { contains: keyValue } },
                { prectures: { contains: keyValue } },
            ];
        }
        
        // 都道府県フィルター条件
        if(prefecture && prefecture !== "all") {
            if(whereCondition.OR) {
                // キーワード検索とフィルターを併用する場合
                whereCondition = {
                    AND: [
                        { prectures: prefecture },
                        { OR: whereCondition.OR }
                    ]
                };
            } else {
                // フィルターのみの場合
                whereCondition.prectures = prefecture;
            }
        }
        
        // 条件に一致するスポット数を取得
        const totalCount = await prisma.spot.count({
            where: whereCondition
        });

        // スポットの取得
        const spots = await prisma.spot.findMany({
            where: whereCondition,
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
            }
        });
    } catch (error) {
        console.error("スポット取得中にエラーが発生しました:", error);
        return NextResponse.json({ 
            message: "スポット取得中にエラーが発生しました", 
            error: error 
        }, { status: 500 });
    }
}