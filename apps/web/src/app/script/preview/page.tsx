'use client';

import { PreviewPage } from '@lambda/preview-workspace';

import { WritingGate } from '../../../lambda-web/WritingGate.js';

export default function PreviewRoute() {
  return (
    <WritingGate>
      <PreviewPage />
    </WritingGate>
  );
}
