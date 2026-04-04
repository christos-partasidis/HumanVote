import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/competitions/[id] — Get a competition with entries and vote counts
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { votes: true } },
    },
  });

  if (!competition) {
    return NextResponse.json(
      { error: "Competition not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(competition);
}
