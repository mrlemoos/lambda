import { describe, expect, it } from 'vitest';

import { importedImageSrc } from './importedImageSrc.js';

describe('importedImageSrc', () => {
  it('returns the src string from a Next.js static image import', () => {
    const image = { src: '/_next/static/media/film-crew.png' };

    const result = importedImageSrc(image);

    expect(result).toBe('/_next/static/media/film-crew.png');
  });

  it('returns a Vite string import unchanged', () => {
    const image = '/assets/film-crew.png';

    const result = importedImageSrc(image);

    expect(result).toBe('/assets/film-crew.png');
  });
});
