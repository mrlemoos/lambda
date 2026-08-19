'use client';

import { WelcomePage } from '@lambda/welcome';
import { useRouter } from 'next/navigation';

import { useWritingAccess } from '../lambda-web/WritingAccessProvider.js';

export default function WelcomeRoute() {
  const router = useRouter();
  const { writingAccess, hasSession, isPending } = useWritingAccess();

  if (isPending) {
    return null;
  }

  return (
    <WelcomePage
      writingAccess={writingAccess}
      hasSession={hasSession}
      onSignIn={() => router.push('/sign-in')}
      onCreateAccount={() => router.push('/sign-up')}
      onOpenAccount={() => router.push('/sign-in')}
    />
  );
}
