'use client';

import { CommandPaletteHost } from '@lambda/command-palette';
import { EditorZoomProvider } from '@lambda/editor-zoom';
import { LambdaApiProvider } from '@lambda/lambda-api';
import { ScriptSessionProvider } from '@lambda/script-session';
import { ScriptWorkspaceDialogs } from '@lambda/script-workspace';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { ApplicationMenuBar } from '../components/ApplicationMenuBar.js';
import { E2eWindowApi } from '../e2e/E2eWindowApi.js';
import { browserLambdaApi } from '../lib/browserLambdaApi.js';
import { isLambdaWebE2e } from '../lib/isLambdaWebE2e.js';
import { WritingAccessProvider } from './WritingAccessProvider.js';

const e2eEnabled = isLambdaWebE2e();

export function WritingProviders({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <LambdaApiProvider api={browserLambdaApi}>
      <EditorZoomProvider pathname={pathname}>
        <ScriptSessionProvider navigate={(path) => router.push(path)}>
          <WritingAccessProvider>
            {e2eEnabled ? <E2eWindowApi /> : null}
            <ApplicationMenuBar />
            <CommandPaletteHost />
            <ScriptWorkspaceDialogs />
            {children}
          </WritingAccessProvider>
        </ScriptSessionProvider>
      </EditorZoomProvider>
    </LambdaApiProvider>
  );
}
