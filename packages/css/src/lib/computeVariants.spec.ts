import { describe, expect, it } from 'vitest';

import { computeVariants } from './computeVariants.js';

describe('computeVariants', () => {
  it('returns base classes plus the selected variant', () => {
    const button = computeVariants('rounded font-medium', {
      variants: {
        size: {
          sm: 'text-sm',
          lg: 'text-lg',
        },
      },
      defaultVariants: {
        size: 'sm',
      },
    });

    const result = button({ size: 'lg' });

    expect(result).toBe('rounded font-medium text-lg');
  });
});
