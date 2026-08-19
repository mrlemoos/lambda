'use client';

import { SignUpForm } from '@lambda/auth-forms';
import { useRouter } from 'next/navigation';

export default function SignUpRoute() {
  const router = useRouter();

  return <SignUpForm onSignedUp={() => router.push('/')} />;
}
