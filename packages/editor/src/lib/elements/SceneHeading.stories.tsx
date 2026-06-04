import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Scene heading',
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

export const IntKitchen: Story = {
  render: () => <p className="scene-heading">INT. KITCHEN - DAY</p>,
};

export const ForcedSlug: Story = {
  render: () => <p className="scene-heading">.SNIPER SCOPE POV</p>,
};
