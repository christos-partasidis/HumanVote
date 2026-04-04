'use client';

import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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
        <Page.Main>
          <p className="text-gray-500 text-sm">Loading...</p>
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

  return (
    <>
      <Page.Header className="p-0">
        <TopBar title={competition.title} />
      </Page.Header>
      <Page.Main className="flex flex-col gap-4 mb-16">
        <div>
          <p className="text-sm text-gray-600">{competition.description}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>{competition._count.votes} total votes</span>
            <span>
              {ended
                ? 'Ended'
                : `Ends ${new Date(competition.endsAt).toLocaleDateString()}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Entries</h3>
          {!ended && (
            <Link
              href={`/competitions/${id}/entries/new`}
              className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white"
            >
              + Add Entry
            </Link>
          )}
        </div>

        {sorted.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No entries yet. Be the first to add one!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sorted.map((entry, index) => (
              <div
                key={entry.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-300">
                      #{index + 1}
                    </span>
                    <h4 className="font-medium">{entry.title}</h4>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {entry._count.votes} votes
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-8">
                  {entry.description}
                </p>
                {!ended && (
                  <div className="mt-3 ml-8">
                    <VoteButton
                      entryId={entry.id}
                      competitionId={competition.id}
                      onVoted={fetchCompetition}
                    />
                  </div>
                )}
              </div>
            ))}
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

  const handleVote = async () => {
    setStatus('voting');
    setErrorMsg('');

    try {
      // Step 1: Get RP signature for this voting action
      const rpRes = await fetch('/api/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: `vote-${competitionId}` }),
      });

      if (!rpRes.ok) throw new Error('Failed to get RP signature');
      const rpData = await rpRes.json();

      // Step 2: Request World ID verification via MiniKit
      const { MiniKit, VerificationLevel } = await import('@worldcoin/minikit-js');

      if (!MiniKit.isInstalled()) {
        throw new Error('World App not detected. Please open in World App.');
      }

      const verifyPayload = {
        action: `vote-${competitionId}`,
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

      // Step 3: Send proof to our vote API
      const voteRes = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof: result.finalPayload,
          entryId,
          competitionId,
        }),
      });

      const voteData = await voteRes.json();

      if (!voteRes.ok) {
        throw new Error(voteData.error || 'Vote failed');
      }

      setStatus('voted');
      onVoted();
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    }
  };

  if (status === 'voted') {
    return (
      <span className="text-xs text-green-600 font-medium">
        Vote recorded!
      </span>
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
