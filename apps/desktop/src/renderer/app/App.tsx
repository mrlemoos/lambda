import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { WelcomePage } from '../pages/WelcomePage.js';
import { ScriptPage } from '../pages/ScriptPage.js';
import { ScriptSessionProvider } from '../session/ScriptSessionContext.js';

export function App() {
  return (
    <HashRouter>
      <ScriptSessionProvider>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/script" element={<ScriptPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ScriptSessionProvider>
    </HashRouter>
  );
}

export default App;
