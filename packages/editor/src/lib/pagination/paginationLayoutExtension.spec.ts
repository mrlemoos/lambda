import { describe, expect, it } from 'vitest';

import { createScriptEditor } from '../tiptap/useScriptEditor';
import {
  buildPaginationDecorations,
  createSplitDialogueContinuationElement,
  SPLIT_DIALOGUE_CONTINUATION_TEXT,
} from './paginationLayoutExtension';
import type { BlockPlacement } from './types';

describe('buildPaginationDecorations', () => {
  it('does not add node margins for page starts', () => {
    const editor = createScriptEditor({
      content: {
        type: 'doc',
        content: [
          {
            type: 'centeredText',
            content: [{ type: 'text', text: 'THE END' }],
          },
          {
            type: 'action',
            content: [{ type: 'text', text: 'The room falls silent.' }],
          },
        ],
      },
    });
    const placements: BlockPlacement[] = [
      { marginTopPt: 24, topOffsetPt: 648 },
      { marginTopPt: 0, topOffsetPt: 672 },
    ];

    const decorationSet = buildPaginationDecorations(
      editor.state.doc,
      placements,
    );
    const decorations = decorationSet.find();

    expect(decorations).toHaveLength(0);

    editor.destroy();
  });

  it('does not add inline spacers when a block splits across pages', () => {
    const editor = createScriptEditor({
      content: {
        type: 'doc',
        content: [
          {
            type: 'action',
            content: [{ type: 'text', text: 'First page. Second page.' }],
          },
        ],
      },
    });
    const placements: BlockPlacement[] = [
      {
        marginTopPt: 0,
        topOffsetPt: 0,
        pageStarts: [
          {
            textOffset: 'First page. '.length,
            marginTopPt: 48,
            topOffsetPt: 660,
            linesBefore: 2,
            linesAfter: 2,
          },
        ],
      },
    ];

    const decorationSet = buildPaginationDecorations(
      editor.state.doc,
      placements,
    );
    const decorations = decorationSet.find();

    expect(decorations).toHaveLength(0);

    editor.destroy();
  });

  it('adds split-dialogue continuation chrome when dialogue spans pages', () => {
    const editor = createScriptEditor({
      content: {
        type: 'doc',
        content: [
          {
            type: 'character',
            content: [{ type: 'text', text: 'MARA' }],
          },
          {
            type: 'dialogue',
            content: [{ type: 'text', text: 'First page. Second page.' }],
          },
        ],
      },
    });
    const placements: BlockPlacement[] = [
      { marginTopPt: 0, topOffsetPt: 0 },
      {
        marginTopPt: 0,
        topOffsetPt: 0,
        pageStarts: [
          {
            textOffset: 'First page. '.length,
            marginTopPt: 48,
            topOffsetPt: 660,
            linesBefore: 2,
            linesAfter: 2,
          },
        ],
      },
    ];

    const decorationSet = buildPaginationDecorations(
      editor.state.doc,
      placements,
    );
    const decorations = decorationSet.find();

    expect(decorations).toHaveLength(1);
    expect(createSplitDialogueContinuationElement('MARA').textContent).toBe(
      `MARA ${SPLIT_DIALOGUE_CONTINUATION_TEXT}`,
    );

    editor.destroy();
  });
});
