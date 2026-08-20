import type { Meta, StoryObj } from '@storybook/react';

import { LiquidMetalButton } from './LiquidMetalButton';

const meta: Meta<typeof LiquidMetalButton> = {
  title: 'Design system/Liquid-metal button',
  component: LiquidMetalButton,
};

export default meta;

type Story = StoryObj<typeof LiquidMetalButton>;

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
