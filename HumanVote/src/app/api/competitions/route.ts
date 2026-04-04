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
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      creatorAddress: session.user.walletAddress || session.user.id || "",
      endsAt: new Date(endsAt),
    },
  });

  return NextResponse.json(competition, { status: 201 });
}
