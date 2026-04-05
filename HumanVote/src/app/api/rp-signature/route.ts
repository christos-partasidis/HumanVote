import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const signingKey = process.env.RP_SIGNING_KEY?.trim();
  const rpId = process.env.RP_ID?.trim();

  if (!signingKey) {
    return NextResponse.json(
      { error: 'RP_SIGNING_KEY not configured' },
      { status: 500 },
    );
  }

  try {
    const { action } = await req.json();
    const cleanKey = signingKey.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
    const { signRequest } = await import('@worldcoin/idkit-core/signing');
    const { sig, nonce, createdAt, expiresAt } = signRequest({
      signingKeyHex: cleanKey,
      action,
    });

    return NextResponse.json({
      rp_id: rpId,
      sig,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
    });
  } catch (error: unknown) {
    console.error('POST /api/rp-signature error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign request' },
      { status: 500 },
    );
  }
}
