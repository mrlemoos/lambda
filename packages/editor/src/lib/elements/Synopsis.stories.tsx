import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Synopsis',
  decorators: [
    (Story) => (
      <ScriptEditor>
        <Story />
      </ScriptEditor>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const Beat: Story = {
  render: () => (
    <p className="synopsis">= Brick and Steel retire; villains return.</p>
  ),
};
