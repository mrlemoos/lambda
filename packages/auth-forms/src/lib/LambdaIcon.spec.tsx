import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LambdaIcon } from './LambdaIcon.js';

describe('LambdaIcon', () => {
  it('exposes the Lambda mark to assistive tech', () => {
    render(<LambdaIcon />);

    const result = screen.getByRole('img', { name: 'Lambda' });

    expect(result).toBeInTheDocument();
  });
});
