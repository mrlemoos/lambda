import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Section',
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

export const Act: Story = {
  render: () => <p className="section"># Act I</p>,
};

export const NestedSequence: Story = {
  render: () => <p className="section">## Opening chase</p>,
};
