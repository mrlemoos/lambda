import { describe, expect, it } from 'vitest';

import { isSceneHeading } from './SceneHeading';

describe('isSceneHeading', () => {
  it('returns true for INT scene headings', () => {
    expect(isSceneHeading('INT. KITCHEN - DAY')).toBe(true);
    expect(isSceneHeading('INT/EXT. APARTMENT - NIGHT')).toBe(true);
  });

  it('matches scene heading prefixes case-insensitively', () => {
    expect(isSceneHeading("ext. brick's pool - day")).toBe(true);
    expect(isSceneHeading('i/e. moving car - day')).toBe(true);
  });

  it('returns true for forced scene headings with a leading period', () => {
    expect(isSceneHeading('.SNIPER SCOPE POV')).toBe(true);
    expect(isSceneHeading('.Back in the warehouse')).toBe(true);
  });

  it('returns false for non-scene-heading lines', () => {
    expect(isSceneHeading('Steel enters the room.')).toBe(false);
    expect(isSceneHeading('STEEL')).toBe(false);
    expect(isSceneHeading('CUT TO:')).toBe(false);
  });
});
