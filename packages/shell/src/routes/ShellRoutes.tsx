import { Navigate, Route, Routes } from 'react-router-dom';

import { PreviewPage } from '../pages/PreviewPage.js';
import { ScriptPage } from '../pages/ScriptPage.js';
import { WelcomePage } from '../pages/WelcomePage.js';

export function ShellRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/script" element={<ScriptPage />} />
      <Route path="/script/preview" element={<PreviewPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
