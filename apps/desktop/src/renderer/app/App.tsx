import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { WindowDragRegion } from '../components/WindowDragRegion.js';
import { WelcomePage } from '../pages/WelcomePage.js';
import { ScriptPage } from '../pages/ScriptPage.js';
import { ScriptSessionProvider } from '../session/ScriptSessionContext.js';

export function App() {
  return (
    <HashRouter>
      <WindowDragRegion />
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
