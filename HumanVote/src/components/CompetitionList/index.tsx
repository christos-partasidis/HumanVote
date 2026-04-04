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

export const CompetitionList = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/competitions')
      .then((res) => res.json())
      .then((data) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading competitions...</p>;
  }

  if (competitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12 text-center">
        <p className="text-gray-500 text-sm">No competitions yet.</p>
        <p className="text-gray-400 text-xs mt-1">
          Create the first one!
        </p>
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
            className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-base">{comp.title}</h3>
              {ended ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  Ended
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {comp.description}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span>{comp._count.entries} entries</span>
              <span>{comp._count.votes} votes</span>
              <span>
                Ends {new Date(comp.endsAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
