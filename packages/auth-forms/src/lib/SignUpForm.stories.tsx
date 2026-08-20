import type { Meta, StoryObj } from '@storybook/react';

import { SignUpForm } from './SignUpForm';

const meta: Meta<typeof SignUpForm> = {
  title: 'Auth/Sign up',
  component: SignUpForm,
};

export default meta;

type Story = StoryObj<typeof SignUpForm>;

export const Default: Story = {};
