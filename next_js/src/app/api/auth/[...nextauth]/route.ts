import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";

import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { getServerSession as originalGetServerSession } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcrypt';


// import { cache } from "react";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any), // eslint-disable-line
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),

    CredentialsProvider({
        name: 'credentials',
        credentials: {
            //名前とメール
            name: { lable: 'name', type: 'text'},
            email: { lable: 'email', type: 'email'}
        },
        async authorize(credentials) {
            //名前とメールアドレスがない場合はエラー
            if(!credentials?.name || !credentials?.email) {
                throw new Error('名前とメールアドレスが存在しません')
            }

            const { name, email } = credentials

            //ユーザを取得
            const user = await prisma.user.findFirst({
                where: {
                  name,
                  email,
                },
              });
            
            //名前が一致しない場合はエラー
            if(!user) {
                throw new Error('ユーザが存在しません')
            }

            return user
        } 
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (!token.id) {
        const dbUser = await prisma.user.findFirst({
          where: { email: token.email as string },
        });
        if (!dbUser && user) {
            token.id = user.id;
            token.name = user.name;
            token.email = user.email;
            token.picture = user.image;
        } else if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: "/auth/signin", // カスタムサインインページを指定
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// export const getServerSession = cache(() =>
//    originalGetServerSession(authOptions)
// );













// export { default } from "next-auth/middleware";

// export const config = {
//     matcher: [
//         "/TabinoOtomo/(.*)",
//         "!/TabinoOtomo/login"
//       ],
// };