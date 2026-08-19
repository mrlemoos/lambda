'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useWritingAccess } from './WritingAccessProvider.js';
import { writingGateLocation } from './writingGateLocation.js';

export function WritingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { writingAccess, isPending } = useWritingAccess();

  useEffect(() => {
    if (isPending) {
      return;
    }

    const location = writingGateLocation(writingAccess);

    if (location) {
      router.replace(location);
    }
  }, [isPending, router, writingAccess]);

  if (isPending || writingAccess !== 'write') {
    return null;
  }

  return children;
}
