'use client';

import HumanVoteABI from '@/abi/HumanVote.json';
import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { NavArrowLeft } from 'iconoir-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { keccak256, toHex } from 'viem';

// TODO: Replace with your deployed contract address after deploying via Remix
const HUMANVOTE_CONTRACT = process.env.NEXT_PUBLIC_HUMANVOTE_CONTRACT || '0x0000000000000000000000000000000000000000';

function toBytes32(str: string): `0x${string}` {
  return keccak256(toHex(str));
}

interface Entry {
  id: string;
  title: string;
  description: string;
  _count: { votes: number };
}

interface Competition {
  id: string;
  title: string;
  description: string;
  endsAt: string;
  creatorAddress: string;
  entries: Entry[];
  _count: { votes: number };
}

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompetition = useCallback(async () => {
    try {
      const res = await fetch(`/api/competitions/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setCompetition(data);
    } catch {
      setError('Competition not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  if (loading) {
    return (
      <>
        <Page.Header className="p-0">
          <TopBar title="Loading..." />
        </Page.Header>
        <Page.Main className="flex flex-col gap-4">
          <div className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-8 w-1/2 rounded-lg bg-gray-100 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 animate-pulse h-28" />
          ))}
        </Page.Main>
      </>
    );
  }

  if (error || !competition) {
    return (
      <>
        <Page.Header className="p-0">
          <TopBar title="Error" />
        </Page.Header>
        <Page.Main>
          <p className="text-red-500 text-sm">{error}</p>
        </Page.Main>
      </>
    );
  }

  const ended = new Date(competition.endsAt) < new Date();
  const sorted = [...competition.entries].sort(
    (a, b) => b._count.votes - a._count.votes
  );
  const maxVotes = sorted.length > 0 ? Math.max(sorted[0]._count.votes, 1) : 1;

  const timeRemaining = () => {
    const diff = new Date(competition.endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h left`;
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title={competition.title}
          startAdornment={
            <button onClick={() => router.back()}>
              <NavArrowLeft />
            </button>
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col gap-4 mb-16">
        {/* Competition info */}
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600 leading-relaxed">{competition.description}</p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {competition._count.votes} votes
            </span>
            {ended ? (
              <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                Ended
              </span>
            ) : (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                {timeRemaining()}
              </span>
            )}
          </div>
        </div>

        {/* Entries header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Entries
            {sorted.length > 0 && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">({sorted.length})</span>
            )}
          </h3>
          {!ended && (
            <Link
              href={`/competitions/${id}/entries/new`}
              className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white active:scale-95 transition-transform"
            >
              + Add Entry
            </Link>
          )}
        </div>

        {/* Entries list */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">No entries yet</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to add one!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((entry, index) => {
              const pct = Math.round((entry._count.votes / maxVotes) * 100);
              const rankColors = [
                'bg-yellow-400 text-yellow-900',
                'bg-gray-300 text-gray-700',
                'bg-amber-600 text-amber-100',
              ];
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
                    index === 0 && entry._count.votes > 0
                      ? 'border-yellow-200 ring-1 ring-yellow-100'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index < 3 && entry._count.votes > 0
                            ? rankColors[index]
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <h4 className="font-medium leading-tight">{entry.title}</h4>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 tabular-nums">
                      {entry._count.votes}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5 ml-[38px] leading-relaxed">
                    {entry.description}
                  </p>
                  {/* Vote progress bar */}
                  {competition._count.votes > 0 && (
                    <div className="mt-2 ml-[38px]">
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {!ended && (
                    <div className="mt-3 ml-[38px]">
                      <VoteButton
                        entryId={entry.id}
                        competitionId={competition.id}
                        onVoted={fetchCompetition}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Page.Main>
    </>
  );
}

function VoteButton({
  entryId,
  competitionId,
  onVoted,
}: {
  entryId: string;
  competitionId: string;
  onVoted: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'voting' | 'voted' | 'error'>(
    'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [txStatus, setTxStatus] = useState<'none' | 'pending' | 'confirmed' | 'failed'>('none');

  const handleVote = async () => {
    setStatus('voting');
    setErrorMsg('');

    try {
      // Step 1: Get RP signature for this voting action
      const rpRes = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote' }),
      });

      if (!rpRes.ok) throw new Error('Failed to get RP signature');
      const rpData = await rpRes.json();

      // Step 2: Request World ID verification via MiniKit
      const { MiniKit, VerificationLevel } = await import('@worldcoin/minikit-js');

      if (!MiniKit.isInstalled()) {
        throw new Error('World App not detected. Please open in World App.');
      }

      const verifyPayload = {
        action: 'vote',
        verification_level: VerificationLevel.Orb,
        signal: entryId,
        ...(rpData.rp_id
          ? {
              rp_context: {
                rp_id: rpData.rp_id,
                signature: rpData.sig,
                nonce: rpData.nonce,
                created_at: rpData.created_at,
                expires_at: rpData.expires_at,
              },
            }
          : {}),
      };

      const result = await MiniKit.commandsAsync.verify(verifyPayload);

      if ('status' in result.finalPayload && result.finalPayload.status === 'error') {
        throw new Error('Verification cancelled or failed');
      }

      // Step 3: Send proof to our vote API (DB write)
      const voteRes = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof: result.finalPayload,
          entryId,
          competitionId,
          nonce: rpData.nonce,
        }),
      });

      const voteData = await voteRes.json();

      if (!voteRes.ok) {
        throw new Error(voteData.error || 'Vote failed');
      }

      setStatus('voted');
      onVoted();

      // Step 4: Record vote on-chain (best-effort — DB vote already counted)
      if (HUMANVOTE_CONTRACT !== '0x0000000000000000000000000000000000000000') {
        try {
          setTxStatus('pending');
          const nullifierHash = (result.finalPayload as { nullifier_hash?: string }).nullifier_hash || '';

          const txResult = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
              {
                address: HUMANVOTE_CONTRACT as `0x${string}`,
                abi: HumanVoteABI,
                functionName: 'vote',
                args: [
                  toBytes32(competitionId),
                  toBytes32(entryId),
                  toBytes32(nullifierHash),
                ],
              },
            ],
          });

          const txPayload = txResult.finalPayload as { status?: string; transaction_id?: string };
          if (txPayload.status === 'error') {
            setTxStatus('failed');
          } else {
            setTxStatus('confirmed');
          }
        } catch {
          // On-chain tx failed, but DB vote is recorded — that's fine
          setTxStatus('failed');
        }
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    }
  };

  if (status === 'voted') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-600 font-medium">
          Vote recorded!
        </span>
        {txStatus === 'pending' && (
          <span className="text-xs text-yellow-600 animate-pulse">Recording on-chain...</span>
        )}
        {txStatus === 'confirmed' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            On-chain
          </span>
        )}
        {txStatus === 'failed' && (
          <span className="text-xs text-gray-400">(off-chain only)</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleVote}
        disabled={status === 'voting'}
        className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {status === 'voting' ? 'Verifying...' : 'Vote with World ID'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
      )}
    </div>
  );
}
