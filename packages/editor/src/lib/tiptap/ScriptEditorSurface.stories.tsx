import type { Meta, StoryObj } from '@storybook/react';
import { useEditor } from '@tiptap/react';

import type { PageFormat } from '../ScriptEditor';
import { ScriptEditorContent } from './ScriptEditorContent';
import { ScriptEditorSurface } from './ScriptEditorSurface';
import { createScriptEditorExtensions } from './useScriptEditor';

const meta: Meta<typeof ScriptEditorSurface> = {
  title: 'Script editor',
  component: ScriptEditorSurface,
  args: {
    pageFormat: 'us-letter',
  },
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof ScriptEditorSurface>;

export const Default: Story = {};

export const A4: Story = {
  args: {
    pageFormat: 'a4',
  },
};

type ScriptEditorWithContentProps = {
  content: string;
  pageFormat?: PageFormat;
};

function ScriptEditorWithContent({
  content,
  pageFormat = 'us-letter',
}: ScriptEditorWithContentProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createScriptEditorExtensions(),
    content,
    editorProps: {
      attributes: {
        class: 'script-editor-content',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return <ScriptEditorContent editor={editor} pageFormat={pageFormat} />;
}

export const ForcedSceneHeading: Story = {
  render: () => (
    <ScriptEditorWithContent content="<p class='action'>.SNIPER SCOPE POV</p>" />
  ),
};

export const SceneHeading: Story = {
  render: () => (
    <ScriptEditorWithContent content="<p class='scene-heading'>INT. KITCHEN - DAY</p>" />
  ),
};

export const OpeningBeat: Story = {
  render: () => (
    <ScriptEditorWithContent
      content={[
        "<p class='scene-heading'>INT. KITCHEN - DAY</p>",
        "<p class='action'>Steam rises from a mug. STEEL (40s, weathered) stares at the phone.</p>",
        "<p class='character'>STEEL</p>",
        "<p class='dialogue'>Nobody picks up anymore.</p>",
      ].join('')}
    />
  ),
};

export const Outline: Story = {
  render: () => (
    <ScriptEditorWithContent
      content={[
        "<p class='section'># Act I</p>",
        "<p class='synopsis'>= Brick and Steel come out of retirement when villains return.</p>",
        "<p class='section'>## Opening chase</p>",
        "<p class='synopsis'>= Steel pursues the getaway van through downtown.</p>",
        "<p class='scene-heading'>EXT. DOWNTOWN - DAY</p>",
        "<p class='action'>Tires scream. STEEL vaults a barrier, closing the gap.</p>",
        "<p class='section'>### Midpoint</p>",
        "<p class='synopsis'>= The partners realise the job was a setup.</p>",
      ].join('')}
    />
  ),
};
