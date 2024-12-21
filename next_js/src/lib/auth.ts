import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession as originalGetServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import { cache } from "react";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any), // eslint-disable-line
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (!token.id) {
        const dbUser = await prisma.user.findFirst({
          where: { email: token.email as string },
        });
        if (!dbUser) {
          if (user) {
            token.id = user?.id;
          }
          return token;
        }
        token.id = dbUser.id;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
};

export const getServerSession = cache(() =>
   originalGetServerSession(authOptions)
);
