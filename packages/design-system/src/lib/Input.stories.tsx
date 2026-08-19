import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './Input';
import { Label } from './Label';

const meta: Meta<typeof Input> = {
  title: 'Design system/Input',
  component: Input,
};

export default meta;

type Story = StoryObj<typeof Input>;

export const WithLabel: Story = {
  render: () => (
    <Label>
      Email
      <Input type="email" autoComplete="email" />
    </Label>
  ),
};
