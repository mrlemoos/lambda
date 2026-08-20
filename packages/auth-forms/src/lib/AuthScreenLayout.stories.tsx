import type { Meta, StoryObj } from '@storybook/react';

import { AuthScreenLayout } from './AuthScreenLayout';

const meta: Meta<typeof AuthScreenLayout> = {
  title: 'Auth/Screen layout',
  component: AuthScreenLayout,
};

export default meta;

type Story = StoryObj<typeof AuthScreenLayout>;

export const Default: Story = {
  args: {
    children: <h1 className="ui-heading">Sign in</h1>,
  },
};
