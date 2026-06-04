import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Action',
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

export const Narrative: Story = {
  render: () => (
    <p className="action">They drink long and well from the beers.</p>
  ),
};

export const ForcedAction: Story = {
  render: () => <p className="action">!SCANNING THE AISLES…</p>,
};
