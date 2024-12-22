import { PrismaClient } from '@prisma/client'

declare global {
    // グローバルオブジェクトにprismaという名前の変数を追加
  var prisma: PrismaClient | undefined
}

// PrismaClientのインスタンス作成
// グローバルに設定されているprismaインスタンスがあればそれを使い、なければ新しくインスタンする
const client = globalThis.prisma || new PrismaClient()

// 開発環境でのみグローバルオブジェクトにprismaクライアントを保存する
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = client
}

export default client