import { describe, expect, it } from 'vitest';

import { isDirty } from './isDirty.js';

describe('isDirty', () => {
  it('is clean when saved and current text match', () => {
    expect(isDirty('INT. HOUSE - DAY\n', 'INT. HOUSE - DAY\n')).toBe(false);
  });

  it('is dirty when current text differs from last save', () => {
    expect(isDirty('INT. HOUSE - DAY\n', 'INT. HOUSE - NIGHT\n')).toBe(true);
  });
});
