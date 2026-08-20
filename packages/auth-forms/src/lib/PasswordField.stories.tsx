import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { PasswordField } from './PasswordField';

const meta: Meta<typeof PasswordField> = {
  title: 'Auth/Password field',
  component: PasswordField,
};

export default meta;

type Story = StoryObj<typeof PasswordField>;

export const Default: Story = {
  render: function PasswordFieldStory() {
    const [value, setValue] = useState('correct horse');

    return (
      <PasswordField
        name="password"
        value={value}
        autoComplete="current-password"
        onChange={(event) => {
          const target = (event as { target?: { value?: string } }).target;
          setValue(target?.value ?? '');
        }}
        onBlur={() => undefined}
        fieldRef={() => undefined}
      />
    );
  },
};
