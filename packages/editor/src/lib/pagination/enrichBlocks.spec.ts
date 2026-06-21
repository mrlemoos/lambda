import { describe, expect, it } from 'vitest';

import { enrichBlocks } from './enrichBlocks';
import { paginateScript } from './paginateScript';
import { paginationLineWeight } from './lineWeight';
import { getPageLayout } from './pageLayout';
import type { ScriptBlock } from './types';

function actionLines(count: number): ScriptBlock[] {
  return Array.from({ length: count }, (_, index) => [
    {
      type: 'action' as const,
      text: `Action line ${index + 1}.`,
    },
    {
      type: 'action' as const,
      text: '',
    },
  ]).flat();
}

function splitDialogueBlocks(): ScriptBlock[] {
  const longDialogue = Array.from(
    { length: 12 },
    (_, index) =>
      `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
  ).join(' ');

  return [
    { type: 'sceneHeading', text: 'INT. LOFT - DAY' },
    ...actionLines(19),
    { type: 'character', text: 'MARA' },
    { type: 'dialogue', text: longDialogue },
  ];
}

describe('enrichBlocks', () => {
  it('injects splitDialogueCharacter before dialogue that split across pages', () => {
    const rawBlocks = splitDialogueBlocks();
    const firstPass = paginateScript(rawBlocks);
    const dialogueIndex = rawBlocks.findIndex(
      (block) => block.type === 'dialogue',
    );

    expect(
      firstPass.placements[dialogueIndex]?.pageStarts?.length,
    ).toBeGreaterThan(0);

    const enrichedBlocks = enrichBlocks(rawBlocks, firstPass);
    const splitIndex = enrichedBlocks.findIndex(
      (block) => block.type === 'splitDialogueCharacter',
    );
    const enrichedDialogueIndex = enrichedBlocks.findIndex(
      (block) => block.type === 'dialogue',
    );

    expect(splitIndex).toBeGreaterThanOrEqual(0);
    expect(enrichedDialogueIndex).toBe(splitIndex + 1);
    expect(enrichedBlocks[splitIndex]).toEqual({
      type: 'splitDialogueCharacter',
      text: "MARA (CONT'D)",
    });
  });

  it("annotates a returning character cue with (CONT'D) after intervening action", () => {
    const rawBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. KITCHEN - DAY' },
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: 'First line.' },
      { type: 'action', text: 'She turns away.' },
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: 'Second line.' },
    ];

    const enrichedBlocks = enrichBlocks(rawBlocks, paginateScript(rawBlocks));
    const returningCharacterIndex = enrichedBlocks.findIndex((block) =>
      block.text.includes("(CONT'D)"),
    );

    expect(enrichedBlocks[returningCharacterIndex].text).toBe("MARA (CONT'D)");
    expect(enrichedBlocks[1].text).toBe('MARA');
  });

  it('does not annotate the first character cue in a scene', () => {
    const rawBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. KITCHEN - DAY' },
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: 'Only once.' },
    ];

    const enrichedBlocks = enrichBlocks(rawBlocks, paginateScript(rawBlocks));

    expect(enrichedBlocks[1].text).toBe('MARA');
  });

  it('does not annotate a character cue after another character speaks', () => {
    const rawBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. PORCH - NIGHT' },
      { type: 'character', text: 'MARIO' },
      { type: 'dialogue', text: 'Careful.' },
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: 'I know.' },
      { type: 'character', text: 'MARIO' },
      { type: 'dialogue', text: 'Then put it away.' },
    ];

    const enrichedBlocks = enrichBlocks(rawBlocks, paginateScript(rawBlocks));
    const marioCues = enrichedBlocks.filter((block) =>
      block.text.startsWith('MARIO'),
    );

    expect(marioCues).toEqual([
      { type: 'character', text: 'MARIO' },
      { type: 'character', text: 'MARIO' },
    ]);
  });

  it('does not annotate when blank action spacers sit between character turns', () => {
    const rawBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'EXT. A BUNGALOW PORCH - SAME' },
      { type: 'character', text: 'MARIO' },
      { type: 'parenthetical', text: '(sotto)' },
      { type: 'dialogue', text: 'He called me kid? --' },
      { type: 'action', text: '' },
      { type: 'action', text: '' },
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: '-- We are not allowed to say his name...' },
      { type: 'action', text: '' },
      { type: 'action', text: '' },
      { type: 'character', text: 'MARIO' },
      { type: 'parenthetical', text: '(sotto again)' },
      { type: 'dialogue', text: "He won't step outside --" },
    ];

    const enrichedBlocks = enrichBlocks(rawBlocks, paginateScript(rawBlocks));
    const marioCues = enrichedBlocks.filter((block) =>
      block.text.startsWith('MARIO'),
    );

    expect(marioCues).toEqual([
      { type: 'character', text: 'MARIO' },
      { type: 'character', text: 'MARIO' },
    ]);
  });

  it("strips a stale (CONT'D) marker from the source cue before re-evaluating", () => {
    const rawBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. PORCH - NIGHT' },
      { type: 'character', text: 'MARIO' },
      { type: 'dialogue', text: 'Careful.' },
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: 'I know.' },
      { type: 'character', text: "MARIO (CONT'D)" },
      { type: 'dialogue', text: 'Then put it away.' },
    ];

    const enrichedBlocks = enrichBlocks(rawBlocks, paginateScript(rawBlocks));
    const marioCues = enrichedBlocks.filter((block) =>
      block.text.startsWith('MARIO'),
    );

    expect(marioCues).toEqual([
      { type: 'character', text: 'MARIO' },
      { type: 'character', text: 'MARIO' },
    ]);
  });

  it('does not annotate when action and other characters separate the same speaker', () => {
    const rawBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'EXT. A BUNGALOW PORCH - SAME' },
      { type: 'character', text: 'RUSSELL (O.S.)' },
      { type: 'dialogue', text: "Who's sent ya, kids?" },
      { type: 'action', text: 'Guillermo pulls his gun out.' },
      { type: 'character', text: 'MARIO' },
      { type: 'dialogue', text: 'Careful.' },
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: 'I know.' },
      { type: 'character', text: 'RUSSELL (O.S.)' },
      { type: 'dialogue', text: "Just wait a sec, I'm gonna change." },
    ];

    const enrichedBlocks = enrichBlocks(rawBlocks, paginateScript(rawBlocks));
    const russellCues = enrichedBlocks.filter((block) =>
      block.text.startsWith('RUSSELL'),
    );

    expect(russellCues).toEqual([
      { type: 'character', text: 'RUSSELL (O.S.)' },
      { type: 'character', text: 'RUSSELL (O.S.)' },
    ]);
  });

  it('matches the porch scene exchange from preview parity', () => {
    const guillermoDialogue =
      '-- We are not allowed to say his name, Mr. Von Saleski. Please, we are politely asking you to step outside and get in the car.';
    const rawBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'EXT. A BUNGALOW PORCH - SAME' },
      { type: 'character', text: 'RUSSELL (O.S.)' },
      { type: 'dialogue', text: "Who's sent ya, kids?" },
      { type: 'character', text: 'MARIO' },
      { type: 'parenthetical', text: '(sotto)' },
      { type: 'dialogue', text: 'He called me kid? --' },
      { type: 'action', text: '' },
      { type: 'action', text: '' },
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: guillermoDialogue },
      { type: 'action', text: '' },
      { type: 'action', text: '' },
      { type: 'character', text: 'MARIO' },
      { type: 'parenthetical', text: '(sotto again)' },
      { type: 'dialogue', text: "He won't step outside --" },
      { type: 'character', text: 'RUSSELL (O.S.)' },
      { type: 'dialogue', text: "Just wait a sec, I'm gonna change." },
    ];

    const enrichedBlocks = enrichBlocks(rawBlocks, paginateScript(rawBlocks));
    const contdCues = enrichedBlocks.filter(
      (block) => block.type === 'character' && block.text.includes("(CONT'D)"),
    );

    expect(contdCues).toEqual([]);
  });
});

describe('two-pass pagination with enrichBlocks', () => {
  it('gives splitDialogueCharacter zero line weight on the second pass', () => {
    const rawBlocks = splitDialogueBlocks();
    const layout = getPageLayout('us-letter');
    const firstPass = paginateScript(rawBlocks);
    const enrichedBlocks = enrichBlocks(rawBlocks, firstPass);
    const secondPass = paginateScript(enrichedBlocks);
    const splitIndex = enrichedBlocks.findIndex(
      (block) => block.type === 'splitDialogueCharacter',
    );
    const splitPlacement = secondPass.placements[splitIndex];
    const dialogueIndex = enrichedBlocks.findIndex(
      (block) => block.type === 'dialogue',
    );
    const dialoguePlacement = secondPass.placements[dialogueIndex];
    const splitBlock = enrichedBlocks[splitIndex];

    const splitLineWeight = paginationLineWeight(splitBlock, layout, 0);

    expect(splitLineWeight).toBe(0);
    expect(splitPlacement.topOffsetPt).toBe(
      dialoguePlacement.pageStarts?.[0]?.topOffsetPt,
    );
  });

  it("counts scene-continuity (CONT'D) toward the line budget on the second pass", () => {
    const layout = getPageLayout('us-letter');
    const contdCharacter = {
      type: 'character' as const,
      text: "MARA (CONT'D)",
    };
    const splitCharacter = {
      type: 'splitDialogueCharacter' as const,
      text: "MARA (CONT'D)",
    };

    const contdLineWeight = paginationLineWeight(contdCharacter, layout, 0);
    const splitLineWeight = paginationLineWeight(splitCharacter, layout, 0);

    expect(contdLineWeight).toBeGreaterThan(0);
    expect(splitLineWeight).toBe(0);
  });
});
