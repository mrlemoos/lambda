import type { Meta, StoryObj } from '@storybook/react';

import { TitlePageView } from './TitlePageView';

const meta: Meta<typeof TitlePageView> = {
  title: 'Elements/Title page',
  component: TitlePageView,
  args: {
    pageFormat: 'us-letter',
  },
};

export default meta;

type Story = StoryObj<typeof TitlePageView>;

const brickAndSteel = [
  'Title:',
  '    BRICK & STEEL',
  '    FULL RETIRED',
  'Credit: Written by',
  'Author: Stu Maschwitz',
  'Source: Story by KTM',
  'Draft date: 1/20/2012',
  'Contact:',
  '    Next Level Productions',
  '    1588 Mission Dr.',
  '    Solvang, CA 93463',
];

export const UsLetter: Story = {
  args: {
    lines: brickAndSteel,
    pageFormat: 'us-letter',
  },
};

export const A4: Story = {
  args: {
    lines: brickAndSteel,
    pageFormat: 'a4',
  },
};

export const Minimal: Story = {
  args: {
    lines: [
      'Title: BRICK & STEEL',
      'Author: Stu Maschwitz',
      'Draft date: 1/20/2012',
    ],
  },
};

export const MultilineTitle: Story = {
  args: {
    lines: [
      'Title:',
      '    Time Chef 2',
      '    Fricassee You Later',
      'Author: Stu Maschwitz',
    ],
  },
};
