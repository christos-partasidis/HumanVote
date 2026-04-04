'use client';

import HumanVoteABI from '@/abi/HumanVote.json';
import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import { NavArrowLeft } from 'iconoir-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { keccak256, toHex } from 'viem';

const HUMANVOTE_CONTRACT = process.env.NEXT_PUBLIC_HUMANVOTE_CONTRACT || '0x0000000000000000000000000000000000000000';

function toBytes32(str: string): `0x${string}` {
  return keccak256(toHex(str));
}

export default function NewCompetition() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, endsAt: `${endDate}T${endTime}` }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create competition');
      }

      const competition = await res.json();

      // Record competition on-chain (best-effort)
      if (HUMANVOTE_CONTRACT !== '0x0000000000000000000000000000000000000000') {
        try {
          const { MiniKit } = await import('@worldcoin/minikit-js');
          if (MiniKit.isInstalled()) {
            const endsAtTimestamp = Math.floor(new Date(`${endDate}T${endTime}`).getTime() / 1000);
            await MiniKit.commandsAsync.sendTransaction({
              transaction: [
                {
                  address: HUMANVOTE_CONTRACT as `0x${string}`,
                  abi: HumanVoteABI,
                  functionName: 'createCompetition',
                  args: [toBytes32(competition.id), BigInt(endsAtTimestamp)],
                },
              ],
            });
          }
        } catch {
          // On-chain creation failed — DB record exists, continue
        }
      }

      router.push(`/competitions/${competition.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="New Competition"
          startAdornment={
            <button onClick={() => router.back()}>
              <NavArrowLeft />
            </button>
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col gap-4 mb-16">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best Hackathon Project"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this competition is about..."
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-black py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Competition'}
          </button>
        </form>
      </Page.Main>
    </>
  );
}
