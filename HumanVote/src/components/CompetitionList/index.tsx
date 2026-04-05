'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Competition {
  id: string;
  title: string;
  description: string;
  endsAt: string;
  createdAt: string;
  _count: { entries: number; votes: number };
}

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h left`;
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export const CompetitionList = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/competitions')
      .then((res) => res.json())
      .then((data) => {
        setCompetitions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (competitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm font-medium">No competitions yet</p>
        <p className="text-gray-400 text-xs mt-1">Create the first one!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {competitions.map((comp) => {
        const ended = new Date(comp.endsAt) < new Date();
        return (
          <Link
            key={comp.id}
            href={`/competitions/${comp.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight">{comp.title}</h3>
              {ended ? (
                <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  Ended
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {comp.description}
            </p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {comp._count.entries} entries
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {comp._count.votes} votes
              </span>
              <span className="ml-auto font-medium">
                {ended ? (
                  <span className="text-gray-400">Ended</span>
                ) : (
                  <span className="text-green-600">{timeRemaining(comp.endsAt)}</span>
                )}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
