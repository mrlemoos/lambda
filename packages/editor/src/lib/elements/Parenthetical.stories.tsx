import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Parenthetical',
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

export const StartingEngine: Story = {
  render: () => <p className="parenthetical">(starting the engine)</p>,
};

export const Pause: Story = {
  render: () => <p className="parenthetical">(pause)</p>,
};
