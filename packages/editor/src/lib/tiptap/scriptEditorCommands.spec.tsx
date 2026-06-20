import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ScriptEditorCommandsProvider,
  useScriptEditorCommands,
} from './scriptEditorCommands.js';
import { createScriptEditor } from './useScriptEditor.js';

describe('useScriptEditorCommands', () => {
  it('returns null outside ScriptEditorCommandsProvider', () => {
    const { result } = renderHook(() => useScriptEditorCommands());

    expect(result.current).toBeNull();
  });

  it('provides command handlers inside ScriptEditorCommandsProvider', () => {
    const editor = createScriptEditor();

    const { result } = renderHook(() => useScriptEditorCommands(), {
      wrapper: ({ children }) => (
        <ScriptEditorCommandsProvider editor={editor}>
          {children}
        </ScriptEditorCommandsProvider>
      ),
    });

    expect(typeof result.current?.undo).toBe('function');
    expect(typeof result.current?.selectAll).toBe('function');

    editor.destroy();
  });
});
