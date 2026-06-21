import type { JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';

import { paginateSessionDocument } from './paginateSessionDocument';

describe('paginateSessionDocument', () => {
  it('returns enriched blocks and pagination for a session document', () => {
    const document: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: 'INT. KITCHEN - DAY' }],
        },
        {
          type: 'action',
          content: [{ type: 'text', text: 'Steam rises from the kettle.' }],
        },
      ],
    };

    const result = paginateSessionDocument({
      document,
      titlePageLines: ['Title: Night Shift'],
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
    });

    expect(result.blocks.length).toBeGreaterThan(2);
    expect(result.pagination.pages.length).toBeGreaterThan(0);
    expect(result.pagination.placements).toHaveLength(result.blocks.length);
    expect(result.pagination.hasTitlePage).toBe(true);
  });

  it('returns preview blocks aligned with collapsed placements when dialogue splits', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const document: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'sceneHeading',
          content: [{ type: 'text', text: 'INT. LOFT - DAY' }],
        },
        ...Array.from({ length: 19 }, (_, index) => [
          {
            type: 'action' as const,
            content: [{ type: 'text', text: `Action line ${index + 1}.` }],
          },
          {
            type: 'action' as const,
            content: [{ type: 'text', text: '' }],
          },
        ]).flat(),
        {
          type: 'character',
          content: [{ type: 'text', text: 'MARA' }],
        },
        {
          type: 'dialogue',
          content: [{ type: 'text', text: longDialogue }],
        },
      ],
    };

    const result = paginateSessionDocument({
      document,
      titlePageLines: [],
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
    });

    expect(
      result.blocks.some((block) => block.type === 'splitDialogueCharacter'),
    ).toBe(false);
    expect(result.pagination.placements).toHaveLength(result.blocks.length);

    const dialogueIndex = result.blocks.findIndex(
      (block) => block.type === 'dialogue',
    );
    const dialoguePlacement = result.pagination.placements[dialogueIndex];

    expect(dialoguePlacement?.pageStarts?.length).toBeGreaterThan(0);
    expect(dialoguePlacement?.splitDialogueCharacter).toBeDefined();
  });
});
