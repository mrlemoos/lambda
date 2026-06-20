import { Navigate, Route, Routes } from 'react-router-dom';

import { ScriptPage } from '../pages/ScriptPage.js';
import { WelcomePage } from '../pages/WelcomePage.js';

export function ShellRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/script" element={<ScriptPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
