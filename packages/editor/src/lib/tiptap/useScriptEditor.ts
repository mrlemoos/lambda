import { Editor, type EditorOptions, type JSONContent } from '@tiptap/core';
import History from '@tiptap/extension-history';
import Text from '@tiptap/extension-text';
import { useEditor } from '@tiptap/react';
import { useMemo } from 'react';

import { PaginationLayout } from '../pagination/paginationLayoutExtension';
import { Action } from './actionExtension';
import { CenteredText } from './centeredTextExtension';
import { Character } from './characterExtension';
import { ClassifyCurrentBlock } from './classifyCurrentBlock';
import { ClassifyOnEnter } from './classifyOnEnter';
import { NormalizeScriptBlocks } from './normalizeScriptBlocks';
import { Dialogue } from './dialogueExtension';
import { ForcedPrefixHighlight } from './forcedPrefixHighlight';
import { Bold, Italic, Underline } from './inlineMarkExtensions';
import { Note } from './noteExtension';
import { Parenthetical } from './parentheticalExtension';
import { SceneHeading } from './sceneHeadingExtension';
import { ScriptDocument } from './scriptDocumentExtension';
import { Section } from './sectionExtension';
import { Synopsis } from './synopsisExtension';
import { Transition } from './transitionExtension';

const EDITOR_RUNTIME_MARKER = 'lambda-editor-classify-v3';

export function getEditorRuntimeMarker(): string {
  return EDITOR_RUNTIME_MARKER;
}

export function createScriptEditorExtensions() {
  return [
    ScriptDocument,
    Text,
    Bold,
    Italic,
    Underline,
    Action,
    SceneHeading,
    Section,
    Synopsis,
    Note,
    CenteredText,
    Character,
    Parenthetical,
    Dialogue,
    Transition,
    ClassifyOnEnter,
    ClassifyCurrentBlock,
    NormalizeScriptBlocks,
    ForcedPrefixHighlight,
    PaginationLayout,
    History,
  ];
}

const defaultEditorOptions = {
  extensions: createScriptEditorExtensions(),
  editorProps: {
    attributes: {
      class: 'script-editor-content',
    },
  },
} satisfies Partial<EditorOptions>;

export function createScriptEditor(
  options: Partial<EditorOptions> = {},
): Editor {
  return new Editor({
    ...defaultEditorOptions,
    ...options,
    extensions: options.extensions ?? defaultEditorOptions.extensions,
  });
}

export function useScriptEditor(initialContent?: JSONContent): Editor | null {
  const extensions = useMemo(() => {
    if (import.meta.env.DEV) {
      const names = createScriptEditorExtensions().map(
        (extension) => extension.name,
      );

      console.info(
        `[${EDITOR_RUNTIME_MARKER}] TipTap extensions:`,
        names.join(', '),
      );
    }

    return createScriptEditorExtensions();
  }, []);

  return useEditor(
    {
      extensions,
      immediatelyRender: false,
      content: initialContent,
      editorProps: defaultEditorOptions.editorProps,
    },
    [extensions],
  );
}
