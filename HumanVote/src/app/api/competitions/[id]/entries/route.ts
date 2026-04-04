import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/competitions/[id]/entries — Add an entry to a competition
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO: Re-enable auth before production
  // const session = await auth();
  // if (!session?.user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const { id: competitionId } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
  });

  if (!competition) {
    return NextResponse.json(
      { error: "Competition not found" },
      { status: 404 }
    );
  }

  if (new Date() > competition.endsAt) {
    return NextResponse.json(
      { error: "Competition has ended" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { title, description } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.entry.create({
    data: {
      title,
      description,
      competitionId,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
