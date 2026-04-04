import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IVotePayload {
  proof: Record<string, unknown>;
  entryId: string;
  competitionId: string;
}

/**
 * POST /api/vote
 *
 * Flow:
 * 1. Client verifies humanity via World ID (IDKit)
 * 2. Client sends the proof + entryId + competitionId here
 * 3. We verify the proof with World's API
 * 4. We check the nullifier hasn't been used for this competition
 * 5. We store the vote
 *
 * The action for each competition is "vote-{competitionId}" so World ID
 * gives a different nullifier per competition, allowing one vote per human per competition.
 */
export async function POST(req: NextRequest) {
  const { proof, entryId, competitionId } = (await req.json()) as IVotePayload;

  if (!proof || !entryId || !competitionId) {
    return NextResponse.json(
      { error: "proof, entryId, and competitionId are required" },
      { status: 400 }
    );
  }

  // 1. Check competition exists and hasn't ended
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

  // 2. Check entry exists and belongs to this competition
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.competitionId !== competitionId) {
    return NextResponse.json(
      { error: "Entry not found in this competition" },
      { status: 404 }
    );
  }

  // 3. Verify the World ID proof with the World API
  const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
  const action = `vote-${competitionId}`;

  const verifyRes = await fetch(
    `https://developer.worldcoin.org/api/v2/verify/${app_id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...proof, action }),
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.success) {
    return NextResponse.json(
      { error: "World ID verification failed", details: verifyData },
      { status: 400 }
    );
  }

  // 4. Extract nullifier and check uniqueness
  const nullifier = proof.nullifier_hash as string;

  if (!nullifier) {
    return NextResponse.json(
      { error: "Missing nullifier in proof" },
      { status: 400 }
    );
  }

  const existingVote = await prisma.vote.findUnique({
    where: {
      nullifier_competitionId: { nullifier, competitionId },
    },
  });

  if (existingVote) {
    return NextResponse.json(
      { error: "You have already voted in this competition" },
      { status: 409 }
    );
  }

  // 5. Store the vote
  const vote = await prisma.vote.create({
    data: {
      nullifier,
      entryId,
      competitionId,
    },
  });

  return NextResponse.json({ success: true, vote }, { status: 201 });
}
