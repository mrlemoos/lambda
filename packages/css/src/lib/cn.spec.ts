import { describe, expect, it } from 'vitest';

import { cn } from './cn.js';

describe('cn', () => {
  it('merges conflicting Tailwind classes, keeping the last', () => {
    const classes = ['px-2 py-1', 'px-4'];

    const result = cn(classes);

    expect(result).toBe('py-1 px-4');
  });
});
