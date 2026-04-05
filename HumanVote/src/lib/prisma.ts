import { PrismaClient } from "@/generated/prisma/client";
import { createClient } from "@libsql/client/web";
import { PrismaLibSql } from "@prisma/adapter-libsql/web";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  prismaUrl: string;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  console.log("[prisma.ts] createPrismaClient called, TURSO_DATABASE_URL =", url ? url.substring(0, 30) + "..." : "UNDEFINED");
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  const libsqlClient = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaLibSql(libsqlClient as any);

  globalForPrisma.prismaUrl = url;
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  const currentUrl = process.env.TURSO_DATABASE_URL?.trim();
  console.log("[prisma.ts] getPrisma called, hasCached =", !!globalForPrisma.prisma, "cachedUrl =", globalForPrisma.prismaUrl?.substring(0, 20), "currentUrl =", currentUrl?.substring(0, 20));
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
