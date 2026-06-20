import { BrowserRouter } from 'react-router-dom';
import {
  LambdaApiProvider,
  ScriptSessionProvider,
  ShellRoutes,
} from '@lambda/shell';

import { ApplicationMenuBar } from '../components/ApplicationMenuBar.js';
import { E2eRoutes } from '../e2e/E2eRoutes.js';
import { E2eWindowApi } from '../e2e/E2eWindowApi.js';
import { browserLambdaApi } from '../lib/browserLambdaApi.js';

const e2eEnabled = import.meta.env.VITE_E2E === '1';

export function App() {
  return (
    <BrowserRouter>
      <LambdaApiProvider api={browserLambdaApi}>
        <ScriptSessionProvider>
          {e2eEnabled ? <E2eWindowApi /> : null}
          <ApplicationMenuBar />
          {e2eEnabled ? <E2eRoutes /> : <ShellRoutes />}
        </ScriptSessionProvider>
      </LambdaApiProvider>
    </BrowserRouter>
  );
}

export default App;
