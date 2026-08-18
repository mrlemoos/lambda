'use client';

import { BrowserRouter } from 'react-router-dom';
import {
  EditorZoomProvider,
  LambdaApiProvider,
  ScriptSessionProvider,
  ShellRoutes,
} from '@lambda/shell';

import { ApplicationMenuBar } from '../components/ApplicationMenuBar.js';
import { E2eRoutes } from '../e2e/E2eRoutes.js';
import { E2eWindowApi } from '../e2e/E2eWindowApi.js';
import { browserLambdaApi } from '../lib/browserLambdaApi.js';
import { isLambdaWebE2e } from '../lib/isLambdaWebE2e.js';

const e2eEnabled = isLambdaWebE2e();

export function App() {
  return (
    <BrowserRouter>
      <LambdaApiProvider api={browserLambdaApi}>
        <EditorZoomProvider>
          <ScriptSessionProvider>
            {e2eEnabled ? <E2eWindowApi /> : null}
            <ApplicationMenuBar />
            {e2eEnabled ? <E2eRoutes /> : <ShellRoutes />}
          </ScriptSessionProvider>
        </EditorZoomProvider>
      </LambdaApiProvider>
    </BrowserRouter>
  );
}

export default App;
