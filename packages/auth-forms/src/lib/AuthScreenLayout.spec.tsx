import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthScreenLayout } from './AuthScreenLayout.js';

describe('AuthScreenLayout', () => {
  it('places the film crew illustration before the form content', () => {
    render(
      <AuthScreenLayout>
        <h1>Sign in</h1>
      </AuthScreenLayout>,
    );

    const illustration = screen.getByRole('img', {
      name: 'Film crew with a camera',
    });
    const heading = screen.getByRole('heading', { name: 'Sign in' });
    const result = Boolean(
      illustration.compareDocumentPosition(heading) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    expect(result).toBe(true);
  });

  it('shows the Lambda mark above the form', () => {
    render(
      <AuthScreenLayout>
        <h1>Sign in</h1>
      </AuthScreenLayout>,
    );

    const mark = screen.getByRole('img', { name: 'Lambda' });
    const heading = screen.getByRole('heading', { name: 'Sign in' });
    const result = Boolean(
      mark.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    );

    expect(result).toBe(true);
  });
});
