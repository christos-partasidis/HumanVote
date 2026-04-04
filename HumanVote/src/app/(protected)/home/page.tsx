import { auth } from '@/auth';
import { Page } from '@/components/PageLayout';
import { CompetitionList } from '@/components/CompetitionList';
import { Marble, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="HumanVote"
          endAdornment={
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session?.user.username}
              </p>
              <Marble src={session?.user.profilePictureUrl} className="w-12" />
            </div>
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-start justify-start gap-4 mb-16">
        <div className="flex w-full items-center justify-between">
          <h2 className="text-lg font-bold">Competitions</h2>
          <Link
            href="/competitions/new"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
          >
            + New
          </Link>
        </div>
        <CompetitionList />
      </Page.Main>
    </>
  );
}
