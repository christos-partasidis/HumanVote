import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';

export default function Home() {
  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center gap-8 px-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">HumanVote</h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
            Decentralized voting for competitions. Verified by World ID — one human, one vote. Recorded on-chain.
          </p>
        </div>
        <AuthButton />
        <p className="text-xs text-gray-300">Powered by World Chain</p>
      </Page.Main>
    </Page>
  );
}
