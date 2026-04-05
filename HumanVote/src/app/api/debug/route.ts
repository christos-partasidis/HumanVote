import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL || "(not set)";
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;

  // Test creating the client directly
  let clientError = null;
  try {
    const { createClient } = await import("@libsql/client/web");
    const client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    // Try a simple query
    await client.execute("SELECT 1");
  } catch (e: unknown) {
    clientError = String(e);
  }

  return NextResponse.json({
    urlPrefix: url.substring(0, 30) + "...",
    urlLength: url.length,
    hasToken,
    clientError,
  });
}
