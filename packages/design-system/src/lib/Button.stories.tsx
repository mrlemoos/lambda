import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design system/Button',
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Pill: Story = {
  args: {
    shape: 'pill',
    children: 'New script',
  },
};

export const Circle: Story = {
  args: {
    shape: 'circle',
    'aria-label': 'Add',
    children: '+',
  },
};
