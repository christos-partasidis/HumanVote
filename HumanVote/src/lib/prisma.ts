import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql/web";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  prismaUrl: string;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  // Prisma v7: PrismaLibSql takes { url, authToken } directly
  const adapter = new PrismaLibSql({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
  });

  globalForPrisma.prismaUrl = url;
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  const currentUrl = process.env.TURSO_DATABASE_URL?.trim();
  // Recreate if no client or if it was created with a different/missing URL
  if (!globalForPrisma.prisma || globalForPrisma.prismaUrl !== currentUrl) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy: defers client creation until first property access at request time
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
