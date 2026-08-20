'use client';

import { SignInForm } from '@lambda/auth-forms';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInRoute() {
  const router = useRouter();

  return <SignInForm Link={Link} onSignedIn={() => router.push('/')} />;
}
