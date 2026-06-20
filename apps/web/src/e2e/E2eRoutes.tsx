import { ShellRoutes } from '@lambda/shell';
import { Route, Routes } from 'react-router-dom';

import { E2eLoadPage } from './E2eLoadPage.js';

export function E2eRoutes() {
  return (
    <Routes>
      <Route path="/e2e/load/:fixtureName" element={<E2eLoadPage />} />
      <Route path="/*" element={<ShellRoutes />} />
    </Routes>
  );
}
