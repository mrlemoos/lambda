'use client';

import { SignUpForm } from '@lambda/auth-forms';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpRoute() {
  const router = useRouter();

  return <SignUpForm Link={Link} onSignedUp={() => router.push('/')} />;
}
