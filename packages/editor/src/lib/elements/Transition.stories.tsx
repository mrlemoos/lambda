import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Transition',
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

export const CutTo: Story = {
  render: () => <p className="transition">CUT TO:</p>,
};

export const ForcedFade: Story = {
  render: () => <p className="transition">{'> FADE TO BLACK.'}</p>,
};
