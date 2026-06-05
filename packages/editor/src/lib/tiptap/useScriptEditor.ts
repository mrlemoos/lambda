import { Editor, type EditorOptions } from '@tiptap/core';
import History from '@tiptap/extension-history';
import Text from '@tiptap/extension-text';
import { useEditor, type UseEditorOptions } from '@tiptap/react';

import { Action } from './actionExtension';
import { ClassifyOnEnter } from './classifyOnEnter';
import { ForcedPrefixHighlight } from './forcedPrefixHighlight';
import { SceneHeading } from './sceneHeadingExtension';
import { ScriptDocument } from './scriptDocumentExtension';
import { Section } from './sectionExtension';
import { Synopsis } from './synopsisExtension';

export function createScriptEditorExtensions() {
  return [
    ScriptDocument,
    Text,
    Action,
    SceneHeading,
    Section,
    Synopsis,
    ClassifyOnEnter,
    ForcedPrefixHighlight,
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

const defaultUseEditorOptions = {
  ...defaultEditorOptions,
  immediatelyRender: false,
} satisfies UseEditorOptions;

export function createScriptEditor(
  options: Partial<EditorOptions> = {},
): Editor {
  return new Editor({
    ...defaultEditorOptions,
    ...options,
    extensions: options.extensions ?? defaultEditorOptions.extensions,
  });
}

export function useScriptEditor(): Editor | null {
  return useEditor(defaultUseEditorOptions);
}
