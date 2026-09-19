import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL is never empty to prevent fatal Prisma validation crash in serverless environments
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

