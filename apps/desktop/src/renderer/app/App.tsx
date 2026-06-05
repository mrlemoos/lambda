import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { WindowDragRegion } from '../components/WindowDragRegion.js';
import { WelcomePage } from '../pages/WelcomePage.js';
import { ScriptPage } from '../pages/ScriptPage.js';
import {
  ScriptSessionProvider,
  useScriptSession,
} from '../session/ScriptSessionContext.js';

function ScriptWindowDragRegion() {
  const { fileName, script } = useScriptSession();

  return <WindowDragRegion fileName={script ? fileName : null} />;
}

export function App() {
  return (
    <HashRouter>
      <ScriptSessionProvider>
        <ScriptWindowDragRegion />
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
