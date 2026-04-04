import { signRequest } from '@worldcoin/idkit-core/signing';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SIGNING_KEY = process.env.RP_SIGNING_KEY!;
const RP_ID = process.env.RP_ID;

export async function POST(req: Request) {
  if (!SIGNING_KEY) {
    return NextResponse.json(
      { error: 'RP_SIGNING_KEY not configured' },
      { status: 500 },
    );
  }

  const { action } = await req.json();
  const { sig, nonce, createdAt, expiresAt } = signRequest({
    signingKeyHex: SIGNING_KEY,
    action,
  });

  return NextResponse.json({
    rp_id: RP_ID,
    sig,
    nonce,
    created_at: createdAt,
    expires_at: expiresAt,
  });
}
