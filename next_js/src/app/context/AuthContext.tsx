'use client'

import { SessionProvider } from 'next-auth/react'

//AuthContextが受け取る子要素
type AuthContextProps = {
  children: React.ReactNode
}

// 認証コンテキスト
// 受け取ったchildrenをSessionProviderでラップすることで、どこでも簡単に認証状態にアクセスできる
const AuthContext = ({ children }: AuthContextProps) => {
// SessionProviderは認証状態、セッション状態をコンテキストとしてアプリケーションに渡す
  return <SessionProvider>{children}</SessionProvider>
}

export default AuthContext