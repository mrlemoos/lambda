import { Navigate, Route, Routes } from 'react-router-dom';
import { PreviewPage } from '@lambda/preview-workspace';
import { ScriptPage } from '@lambda/script-workspace';
import { WelcomePage } from '@lambda/welcome';
import { SignInForm, SignUpForm } from '@lambda/auth-forms';

export function WritingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/script" element={<ScriptPage />} />
      <Route path="/script/preview" element={<PreviewPage />} />
      <Route path="/sign-in" element={<SignInForm />} />
      <Route path="/sign-up" element={<SignUpForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
