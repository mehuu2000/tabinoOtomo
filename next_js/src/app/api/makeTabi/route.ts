import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    console.log(req);
    try {
        const body = await req.json();
        
        const response = await fetch('http://127.0.0.1:5000/makeTabi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        console.log("api")
        console.log(data.message);

        return NextResponse.json({ message: data.message }, { status: 200 });
    } catch (error) {
        console.error('flaskでのテキストの取得に失敗しました:', error);
        return NextResponse.json({ error: 'flaskへのアクセスに失敗しました'}, { status: 500});
    }
}