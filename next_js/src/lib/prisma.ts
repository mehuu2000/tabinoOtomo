import { PrismaClient } from "@prisma/client";

// declare global {
//   // eslint-disable-next-line
//   var prisma: PrismaClient | undefined;
// }

// export const prisma = global.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// export * from "@prisma/client";

// 開発環境でグローバルにPrismaClientを保持
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ log: ["query"] }); // ログ設定は必要に応じて変更

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

