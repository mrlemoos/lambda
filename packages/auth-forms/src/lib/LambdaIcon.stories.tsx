import type { Meta, StoryObj } from '@storybook/react';

import { LambdaIcon } from './LambdaIcon';

const meta: Meta<typeof LambdaIcon> = {
  title: 'Auth/Lambda icon',
  component: LambdaIcon,
};

export default meta;

type Story = StoryObj<typeof LambdaIcon>;

export const Default: Story = {};
