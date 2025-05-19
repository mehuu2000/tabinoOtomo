import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Spotのスキーマ
const SpotSchema = z.object({
    spotId: z.number().int().positive(),
    day: z.number().int().positive(),
    order: z.number().int().positive(),
})

// リクエストボディのスキーマ
const PlanRequestSchema = z.object({
    title: z.string().min(1, "タイトルは必須です"),
    days: z.number().int().positive("日数は1日以上必要です"),
    fromWhen: z.number().int(),
    isPublic: z.boolean().optional().default(false),
    spots: z.array(SpotSchema).min(1, "スポットは1つ以上必要です"),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if(!session || !session.user) {
            return NextResponse.json(
                {message: "ログインしてください"},
                {status: 401}
            );
        }

        const data = await request.json();
        const validationResult = PlanRequestSchema.safeParse(data);

        if(!validationResult.success) {
            const errors = validationResult.error.flatten();
            return NextResponse.json(
                { message: "入力データが不正です", errors: errors.fieldErrors },
                { status: 400 }
            );
        }

        const { title, days, fromWhen, isPublic, spots } = validationResult.data;

        const userId = session.user.id;

        const result = await prisma.$transaction(async (tx) => {
            // プランを作成
            const newPlan = await tx.plan.create({
                data: {
                    userId: userId,
                    title: title,
                    days: days,
                    fromWhen: fromWhen,
                    isPublic: isPublic,
                    favorite: false,
                    visited: false,
                }
            });

            // スポットを登録(プランに紐づけ)
            if(spots.length > 0) {
                await tx.planItem.createMany({
                    data: spots.map((spot) => ({
                        planId: newPlan.id,
                        spotId: spot.spotId,
                        day: spot.day,
                        order: spot.order,
                    }))
                });
            }
            return newPlan;
        });

        return NextResponse.json({
            success: true,
            message: "プランが保存されました",
            data: result
        });
    } catch (error) {
        console.error("プラン保存中のエラー:", error);
        return NextResponse.json(
            { error: 'プランの保存中にエラーが発生しました' },
            { status: 500 }
          );
    }
}