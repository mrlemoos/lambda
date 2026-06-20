import { BrowserRouter } from 'react-router-dom';
import {
  LambdaApiProvider,
  ScriptSessionProvider,
  ShellRoutes,
} from '@lambda/shell';

import { ApplicationMenuBar } from '../components/ApplicationMenuBar.js';
import { browserLambdaApi } from '../lib/browserLambdaApi.js';

export function App() {
  return (
    <BrowserRouter>
      <LambdaApiProvider api={browserLambdaApi}>
        <ScriptSessionProvider>
          <ApplicationMenuBar />
          <ShellRoutes />
        </ScriptSessionProvider>
      </LambdaApiProvider>
    </BrowserRouter>
  );
}

export default App;
