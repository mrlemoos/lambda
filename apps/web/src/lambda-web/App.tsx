'use client';

import { BrowserRouter } from 'react-router-dom';
import { CommandPaletteHost } from '@lambda/command-palette';
import { EditorZoomProvider } from '@lambda/editor-zoom';
import { LambdaApiProvider } from '@lambda/lambda-api';
import { ScriptSessionProvider } from '@lambda/script-session';
import { ScriptWorkspaceDialogs } from '@lambda/script-workspace';

import { ApplicationMenuBar } from '../components/ApplicationMenuBar.js';
import { E2eRoutes } from '../e2e/E2eRoutes.js';
import { E2eWindowApi } from '../e2e/E2eWindowApi.js';
import { browserLambdaApi } from '../lib/browserLambdaApi.js';
import { isLambdaWebE2e } from '../lib/isLambdaWebE2e.js';
import { WritingRoutes } from './WritingRoutes.js';

const e2eEnabled = isLambdaWebE2e();

export function App() {
  return (
    <BrowserRouter>
      <LambdaApiProvider api={browserLambdaApi}>
        <EditorZoomProvider>
          <ScriptSessionProvider>
            {e2eEnabled ? <E2eWindowApi /> : null}
            <ApplicationMenuBar />
            <CommandPaletteHost />
            <ScriptWorkspaceDialogs />
            {e2eEnabled ? <E2eRoutes /> : <WritingRoutes />}
          </ScriptSessionProvider>
        </EditorZoomProvider>
      </LambdaApiProvider>
    </BrowserRouter>
  );
}

export default App;
