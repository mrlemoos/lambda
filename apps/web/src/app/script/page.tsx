'use client';

import { ScriptPage } from '@lambda/script-workspace';

import { WritingGate } from '../../lambda-web/WritingGate.js';

export default function ScriptRoute() {
  return (
    <WritingGate>
      <ScriptPage />
    </WritingGate>
  );
}
