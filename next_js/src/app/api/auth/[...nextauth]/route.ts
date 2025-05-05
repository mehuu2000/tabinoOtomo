import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs'
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    //メールとパスワードで認証
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'mail', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードが存在しません')
        }
          // ユーザーを取得
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          })
  
          // ユーザーが存在しない場合はエラー
          if (!user || !user?.hashedPassword) {
            throw new Error('ユーザーが存在しません')
          }
  
          // パスワードが一致しない場合はエラー
          const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword)
  
          if (!isCorrectPassword) {
            throw new Error('パスワードが一致しません')
          }
          
          return user
        },
      })
  ],
  session: {
    strategy: "jwt",
    // maxAge: 3 * 24 * 60 * 60, // 3日間
  },
  secret: process.env.NEXTAUTH_SECRET,
  // callbacks: {
  //   async session({ session, user }) {
  //     if (session?.user) {
  //       session.user.id = user.id;
  //     }
  //     return session;
  //   }
  // },


  // debug: process.env.NODE_ENV === 'development',
  // debug: false,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST}







//   callbacks: {
//     async jwt({ token, user }) {
//       if (!token.id) {
//         const dbUser = await prisma.user.findFirst({
//           where: { email: token.email as string },
//         });
//         if (!dbUser && user) {
//             token.id = user.id;
//             token.name = user.name;
//             token.email = user.email;
//             token.picture = user.image;
//         } else if (dbUser) {
//             token.id = dbUser.id;
//             token.name = dbUser.name;
//             token.email = dbUser.email;
//             token.picture = dbUser.image;
//         }
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id as string;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//         session.user.image = token.picture as string;
//       }
//       return session;
//     },
//   },
  
//   secret: process.env.NEXTAUTH_SECRET as string,
//   pages: {
//     signIn: "/auth/signin", // カスタムサインインページを指定
//   }
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

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