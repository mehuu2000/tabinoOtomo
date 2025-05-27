import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const prefecture = searchParams.get("prefecture") || "";
    
    if (!query) {
      // クエリがない場合は空のレスポンス
      return NextResponse.json({
        spots: [],
        pagination: {
          total: 0,
          pageSize: 10,
          currentPage: 1,
          totalPages: 0,
        },
        isAiSearch: true
      });
    }
    
    console.log(`AI検索リクエスト: "${query}"`);
    
    // 必要最小限のスポットデータを取得
    const spotsForRanking = await prisma.spot.findMany({
      where: prefecture ? {
        prectures: {
          contains: prefecture
        }
      } : undefined,
      select: {
        id: true,
        name: true,
        prectures: true,
        description: true,
      }
    });
    
    console.log(`AI検索対象スポット数: ${spotsForRanking.length}件`);

    // スポットが見つからない場合は空のレスポンス
    if (spotsForRanking.length === 0) {
      return NextResponse.json({
        spots: [],
        pagination: {
          total: 0,
          pageSize: 10,
          currentPage: 1,
          totalPages: 0,
        },
        isAiSearch: true
      });
    }
    
    // Flaskサーバーを呼び出してAI検索を実行
    const flaskUrl = process.env.FLASK_API_URL;
    const response = await fetch(`${flaskUrl}/aiSearchRank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spots: spotsForRanking,
        query
      }),
    });
    
    if (!response.ok) {
      console.error("Flask APIエラー:", response.status, await response.text());
      throw new Error('AI検索処理に失敗しました');
    }
    
    // ランキング結果を取得
    const result = await response.json();
    const rankedIds: number[] = result.rankedIds || [];
    
    if (rankedIds.length === 0) {
      return NextResponse.json({
        spots: [],
        pagination: {
          total: 0,
          pageSize: 10,
          currentPage: 1,
          totalPages: 0,
        },
        isAiSearch: true
      });
    }
    
    // ランキング結果に基づいてスポット詳細を取得
    const spots = await prisma.spot.findMany({
      where: {
        id: {
          in: rankedIds
        }
      },
      select: {
        id: true,
        prectures: true,
        name: true,
        description: true,
        imageUrl: true,
        updatedAt: true,
      }
    });
    
    // ランキング順にソート
    const idToIndexMap = rankedIds.reduce<Record<number, number>>((map, id, index) => {
      map[id] = index;
      return map;
    }, {});
    
    const sortedSpots = [...spots].sort((a, b) => 
      (idToIndexMap[a.id] !== undefined ? idToIndexMap[a.id] : 999) - 
      (idToIndexMap[b.id] !== undefined ? idToIndexMap[b.id] : 999)
    );
    
    return NextResponse.json({
      spots: sortedSpots,
      pagination: {
        total: sortedSpots.length,
        pageSize: sortedSpots.length,
        currentPage: 1,
        totalPages: 1,
      },
      isAiSearch: true
    });
    
  } catch (error) {
    console.error("AI検索中にエラーが発生しました:", error);
    return NextResponse.json({ 
      message: "AI検索中にエラーが発生しました", 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}