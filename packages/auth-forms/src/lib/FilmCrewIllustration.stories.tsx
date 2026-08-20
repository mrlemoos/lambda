import type { Meta, StoryObj } from '@storybook/react';

import { FilmCrewIllustration } from './FilmCrewIllustration';

const meta: Meta<typeof FilmCrewIllustration> = {
  title: 'Auth/Film crew',
  component: FilmCrewIllustration,
};

export default meta;

type Story = StoryObj<typeof FilmCrewIllustration>;

export const Default: Story = {};
