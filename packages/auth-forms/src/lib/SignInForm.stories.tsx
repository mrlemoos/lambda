import type { Meta, StoryObj } from '@storybook/react';

import { SignInForm } from './SignInForm';

const meta: Meta<typeof SignInForm> = {
  title: 'Auth/Sign in',
  component: SignInForm,
};

export default meta;

type Story = StoryObj<typeof SignInForm>;

export const Default: Story = {};
