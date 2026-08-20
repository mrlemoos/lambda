import type { ReactNode } from 'react';

import { FilmCrewIllustration } from './FilmCrewIllustration.js';
import { LambdaIcon } from './LambdaIcon.js';

export type AuthScreenLayoutProps = {
  children: ReactNode;
};

export function AuthScreenLayout({ children }: AuthScreenLayoutProps) {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="relative hidden min-h-svh overflow-hidden md:block">
        <FilmCrewIllustration />
      </div>
      <div className="flex min-h-svh items-center justify-center p-8">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <LambdaIcon />
          {children}
        </div>
      </div>
    </div>
  );
}
