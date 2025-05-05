import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/app/lib/prisma'

// ログインユーザー取得
const getCurrentUser = async () => {
  try {
    // セッション情報取得
    const session = await getServerSession(authOptions)

    // ログインしていない場合
    if (!session?.user?.email) {
      console.log("カレントユーザ：セッションないよ")
      return null
    }

    // ログインユーザー取得
    const response = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!response) {
      console.log("データベースにユーザいないよ")
      return null
    }

    // console.log(`どんな感じやろ：${response.id}`)
    return response
  } catch (error) {
    return null
  }
}

export default getCurrentUser