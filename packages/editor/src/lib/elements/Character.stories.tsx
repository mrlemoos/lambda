import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Character',
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

export const Steel: Story = {
  render: () => <p className="character">STEEL</p>,
};

export const WithExtension: Story = {
  render: () => <p className="character">BRICK (O.S.)</p>,
};
