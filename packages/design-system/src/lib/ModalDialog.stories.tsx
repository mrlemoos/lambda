import type { Meta, StoryObj } from '@storybook/react';

import { ModalDialog, ModalDialogTitle } from './ModalDialog';

const meta: Meta<typeof ModalDialog> = {
  title: 'Design system/Modal dialog',
  component: ModalDialog,
};

export default meta;

type Story = StoryObj<typeof ModalDialog>;

export const Open: Story = {
  args: {
    open: true,
    children: (
      <>
        <ModalDialogTitle>Save changes?</ModalDialogTitle>
        <p>Save changes to this script before continuing?</p>
      </>
    ),
  },
};
