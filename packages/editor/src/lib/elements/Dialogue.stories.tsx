import type { Meta, StoryObj } from '@storybook/react';

import { ScriptEditor } from '../ScriptEditor';

const meta: Meta = {
  title: 'Elements/Dialogue',
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

export const AfterCharacter: Story = {
  render: () => (
    <>
      <p className="character">DARTH VADER</p>
      <p className="dialogue">Luke. Search your feelings.</p>
    </>
  ),
};

export const AfterParenthetical: Story = {
  render: () => (
    <>
      <p className="character">DEALER</p>
      <p className="parenthetical">(pause)</p>
      <p className="dialogue">Hit or stand sir?</p>
    </>
  ),
};
