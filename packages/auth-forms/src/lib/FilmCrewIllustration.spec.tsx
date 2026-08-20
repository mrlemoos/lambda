import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilmCrewIllustration } from './FilmCrewIllustration.js';

vi.mock('./film-crew.png', () => ({
  default: { src: '/film-crew.png' },
}));

describe('FilmCrewIllustration', () => {
  it('renders the film crew image', () => {
    render(<FilmCrewIllustration />);

    const result = screen.getByRole('img', {
      name: 'Film crew with a camera',
    });

    expect(result).toBeInTheDocument();
  });

  it('uses the URL from a Next.js static image import', () => {
    render(<FilmCrewIllustration />);

    const result = screen.getByRole('img', {
      name: 'Film crew with a camera',
    });

    expect(result).toHaveAttribute('src', '/film-crew.png');
  });
});
