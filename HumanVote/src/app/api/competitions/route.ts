import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/competitions — List all competitions
export async function GET() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { entries: true, votes: true } },
    },
  });

  return NextResponse.json(competitions);
}

// POST /api/competitions — Create a new competition
export async function POST(req: NextRequest) {
  // TODO: Re-enable auth before production
  let creatorAddress = "anonymous";
  try {
    const session = await auth();
    if (session?.user) {
      creatorAddress = session.user.walletAddress || session.user.id || "anonymous";
    }
  } catch {
    // No session available during local testing
  }

  try {
    const body = await req.json();
    const { title, description, imageUrl, endsAt } = body;

    if (!title || !description || !endsAt) {
      return NextResponse.json(
        { error: "title, description, and endsAt are required" },
        { status: 400 }
      );
    }

    const competition = await prisma.competition.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        creatorAddress,
        endsAt: new Date(endsAt),
      },
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (err) {
    console.error("POST /api/competitions error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
