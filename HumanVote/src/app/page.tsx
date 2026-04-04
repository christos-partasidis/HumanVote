import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';

export default function Home() {
  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center gap-6 px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">HumanVote</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs">
            Decentralized voting for competitions. Verified by World ID — one
            human, one vote.
          </p>
        </div>
        <AuthButton />
      </Page.Main>
    </Page>
  );
}
