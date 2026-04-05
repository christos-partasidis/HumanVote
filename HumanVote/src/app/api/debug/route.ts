import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL?.trim() || "(not set)";
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;

  // Test prisma import
  let prismaTest = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.competition.count();
    prismaTest = { ok: true, count };
  } catch (e: unknown) {
    prismaTest = { ok: false, error: String(e) };
  }

  return NextResponse.json({
    urlPrefix: url.substring(0, 30) + "...",
    urlLength: url.length,
    hasToken,
    prismaTest,
  });
}
