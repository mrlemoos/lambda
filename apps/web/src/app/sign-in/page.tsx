'use client';

import { SignInForm } from '@lambda/auth-forms';
import { useRouter } from 'next/navigation';

export default function SignInRoute() {
  const router = useRouter();

  return <SignInForm onSignedIn={() => router.push('/')} />;
}
