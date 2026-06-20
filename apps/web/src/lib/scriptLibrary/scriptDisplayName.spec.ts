import { describe, expect, it } from 'vitest';

import {
  isUntitledDisplayName,
  resolveScriptDisplayName,
  shouldPersistToLibrary,
} from './scriptDisplayName.js';

describe('resolveScriptDisplayName', () => {
  it('uses Title page metadata when present', () => {
    const text = `Title: BRICK & STEEL
Credit: Written by
Author: Jane Doe

INT. KITCHEN - DAY
`;

    const result = resolveScriptDisplayName(text);

    expect(result).toBe('BRICK & STEEL');
  });

  it('uses the next title page line when Title: is empty', () => {
    const text = `Title:
MY SCRIPT
Credit: by

INT. KITCHEN - DAY
`;

    const result = resolveScriptDisplayName(text);

    expect(result).toBe('MY SCRIPT');
  });

  it('falls back to the import filename without extension', () => {
    const text = 'INT. HOUSE - DAY\n';

    const result = resolveScriptDisplayName(text, 'party.fountain');

    expect(result).toBe('party');
  });

  it('returns Untitled when no title metadata or import filename exists', () => {
    const text = `Title:

Credit: Written by
Author:

`;

    const result = resolveScriptDisplayName(text);

    expect(result).toBe('Untitled');
  });
});

describe('isUntitledDisplayName', () => {
  it('treats Untitled and empty names as untitled', () => {
    expect(isUntitledDisplayName('Untitled')).toBe(true);
    expect(isUntitledDisplayName('')).toBe(true);
    expect(isUntitledDisplayName('  ')).toBe(true);
  });

  it('treats real titles as titled', () => {
    expect(isUntitledDisplayName('JULIE')).toBe(false);
  });
});

describe('shouldPersistToLibrary', () => {
  it('returns false for untitled scripts', () => {
    const text = `Title:

Credit: Written by
Author:

`;

    const result = shouldPersistToLibrary(text);

    expect(result).toBe(false);
  });

  it('returns false when Title metadata is literally Untitled', () => {
    const text = `Title: Untitled

INT. HOUSE - DAY
`;

    const result = shouldPersistToLibrary(text);

    expect(result).toBe(false);
  });

  it('returns true when a real title exists', () => {
    const text = `Title: JULIE

INT. HOUSE - DAY
`;

    const result = shouldPersistToLibrary(text);

    expect(result).toBe(true);
  });

  it('returns true for imports with a filename fallback', () => {
    const text = 'INT. HOUSE - DAY\n';

    const result = shouldPersistToLibrary(text, 'house.fountain');

    expect(result).toBe(true);
  });
});
