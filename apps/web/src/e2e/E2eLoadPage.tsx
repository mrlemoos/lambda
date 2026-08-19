'use client';

import { useScriptSession } from '@lambda/script-session';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { listE2eFixtureNames, readE2eFixture } from './fixtures.js';

export function E2eLoadPage({ fixtureName }: { fixtureName: string }) {
  const { loadScriptFromText } = useScriptSession();
  const router = useRouter();

  useEffect(() => {
    if (!fixtureName) {
      router.push('/');
      return;
    }

    const fixture = readE2eFixture(fixtureName);

    if (!fixture) {
      console.error(
        'E2E fixture not found:',
        fixtureName,
        listE2eFixtureNames(),
      );
      router.push('/');
      return;
    }

    loadScriptFromText(fixture, `${fixtureName}.fountain`);
  }, [fixtureName, loadScriptFromText, router]);

  return (
    <main className="app-shell welcome">
      <p>Loading fixture…</p>
      <a href="/">Back to welcome</a>
    </main>
  );
}
