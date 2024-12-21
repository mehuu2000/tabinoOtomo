import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Flask サーバーにリクエスト
    const response = await fetch('http://127.0.0.1:5000/');
    if (!response.ok) {
      throw new Error(`Failed to fetch from Flask server: ${response.statusText}`);
    }

    const data = await response.text();
    return NextResponse.json({ message: data });
  } catch (error) {
    console.error('Error calling Flask:', error);
    return NextResponse.json(
      { error: 'Failed to call Flask server', details: String(error) },
      { status: 500 }
    );
  }
}
