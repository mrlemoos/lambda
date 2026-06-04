import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TitlePageView } from './TitlePageView';

describe('TitlePageView', () => {
  it('renders values without fountain keys', () => {
    const lines = [
      'Title: BRICK & STEEL',
      'Author: Stu Maschwitz',
      'Draft date: 1/20/2012',
    ];

    render(<TitlePageView lines={lines} />);

    expect(screen.getByText('BRICK & STEEL')).toBeInTheDocument();
    expect(screen.getByText('Stu Maschwitz')).toBeInTheDocument();
    expect(screen.getByText('1/20/2012')).toBeInTheDocument();
    expect(screen.queryByText(/Title:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Author:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft date:/)).not.toBeInTheDocument();
  });

  it('applies page format to the title page sheet', () => {
    const lines = ['Title: BRICK & STEEL'];
    const pageFormat = 'a4';

    render(<TitlePageView lines={lines} pageFormat={pageFormat} />);

    expect(
      screen.getByText('BRICK & STEEL').closest('.title-page-sheet'),
    ).toHaveAttribute('data-page-format', 'a4');
  });
});
