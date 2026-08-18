import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App.js';

describe('desktop renderer App', () => {
  it('does not compose the writing UI', () => {
    const { container } = render(<App />);

    expect(container.firstChild).toBeNull();
  });
});
