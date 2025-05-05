import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;           // カスタムフィールドを追加
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id: string;            // JWT に id フィールドを追加
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}