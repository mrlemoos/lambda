'use client';

import { useParams } from 'next/navigation';

import { E2eLoadPage } from '../../../../e2e/E2eLoadPage.js';

export default function E2eLoadRoute() {
  const { fixtureName } = useParams<{ fixtureName: string }>();

  return <E2eLoadPage fixtureName={fixtureName ?? ''} />;
}
