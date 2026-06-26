import { render, screen } from '@testing-library/react';
import {
  collapseEnrichedPlacements,
  enrichBlocks,
  getPageLayout,
  paginateScript,
  titlePageBlocks,
  type ScriptBlock,
} from '@lambda/editor';
import { describe, expect, it } from 'vitest';

import { ScriptPreviewView } from './ScriptPreviewView';
import { buildPreviewPages } from './buildPreviewPages';

function paginateForPreview(
  bodyBlocks: ScriptBlock[],
  titlePageLines: string[] = [],
) {
  const blocks = [...titlePageBlocks(titlePageLines), ...bodyBlocks];
  const firstPass = paginateScript(blocks);
  const enrichedBlocks = enrichBlocks(blocks, firstPass);
  const secondPass = paginateScript(enrichedBlocks);

  return {
    blocks: enrichedBlocks.filter(
      (block) => block.type !== 'splitDialogueCharacter',
    ),
    pagination: {
      ...secondPass,
      placements: collapseEnrichedPlacements(
        enrichedBlocks,
        secondPass.placements,
      ),
      hasTitlePage: titlePageLines.length > 0,
    },
  };
}

describe('ScriptPreviewView', () => {
  it('renders body page numbers but leaves the title sheet unnumbered', () => {
    const titlePageLines = ['Title: MY SCRIPT'];
    const bodyBlocks: ScriptBlock[] = [{ type: 'action', text: 'Scene one.' }];
    const { blocks, pagination } = paginateForPreview(
      bodyBlocks,
      titlePageLines,
    );

    render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={titlePageLines}
      />,
    );

    expect(screen.getByText('MY SCRIPT')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.queryByText('0.')).not.toBeInTheDocument();
  });

  it('renders each body page as a discrete script-preview-page article', () => {
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. WAREHOUSE - NIGHT' },
      ...Array.from({ length: 50 }, (_, index) => ({
        type: 'action' as const,
        text: `Action line ${index + 1} with enough words to consume vertical space on the page.`,
      })),
    ];
    const titlePageLines = ['Title: MY SCRIPT'];
    const { blocks, pagination } = paginateForPreview(
      bodyBlocks,
      titlePageLines,
    );

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={titlePageLines}
      />,
    );

    expect(container.querySelectorAll('.title-page-sheet')).toHaveLength(1);
    expect(container.querySelectorAll('.script-preview-page')).toHaveLength(
      pagination.pages.length,
    );
  });

  it('positions preview fragments with flow margins derived from pagination', () => {
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. KITCHEN - DAY' },
      { type: 'action', text: 'Steam rises.' },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);
    const preview = buildPreviewPages({
      blocks,
      pagination,
      pageFormat: 'us-letter',
      typeface: 'courier-prime',
      titlePageLines: [],
    });
    const bodyPage = preview.pages.find((page) => page.kind === 'body');

    expect(bodyPage?.fragments[0]?.marginTopPt ?? 0).toBe(0);
    expect(bodyPage?.fragments[1]?.marginTopPt ?? 0).toBe(0);
  });

  it('renders blank action lines with one script line of height', () => {
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. HOUSE - DAY' },
      { type: 'action', text: 'Some action line goes here.' },
      { type: 'action', text: '' },
      { type: 'character', text: 'STEEL' },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );
    const paragraphs = [
      ...container.querySelectorAll('.script-preview-page-body > p'),
    ];
    const blankLine = paragraphs.find((element) =>
      element.classList.contains('script-preview-blank-line'),
    );

    expect(blankLine).toBeDefined();
    expect(blankLine?.textContent).toBe('\u00a0');
  });

  it('omits Fountain force prefixes from preview text', () => {
    const bodyBlocks: ScriptBlock[] = [
      { type: 'action', text: '!OUTSIDE THE WINDSHIELD' },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );

    expect(screen.getByText('OUTSIDE THE WINDSHIELD')).toBeInTheDocument();
    expect(
      screen.queryByText('!OUTSIDE THE WINDSHIELD'),
    ).not.toBeInTheDocument();
  });

  it("does not show scene-continuity (CONT'D) after another character speaks", () => {
    const guillermoDialogue =
      '-- We are not allowed to say his name, Mr. Von Saleski. Please, we are politely asking you to step outside and get in the car.';
    const bodyBlocks: ScriptBlock[] = [
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
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );
    const characterLines = [
      ...container.querySelectorAll('.script-preview-page-body > p.character'),
    ].map((element) => element.textContent);

    expect(characterLines).toEqual([
      'RUSSELL (O.S.)',
      'MARIO',
      'GUILLERMO',
      'MARIO',
      'RUSSELL (O.S.)',
    ]);
  });

  it('renders split-dialogue (MORE) on the reserved last line', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. LOFT - DAY' },
      ...Array.from({ length: 19 }, (_, index) => [
        {
          type: 'action' as const,
          text: `Action line ${index + 1}.`,
        },
        {
          type: 'action' as const,
          text: '',
        },
      ]).flat(),
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: longDialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );
    const morePage = [
      ...container.querySelectorAll('.script-preview-page'),
    ].find((page) => page.querySelector('.split-dialogue-more'));
    const moreMarker = morePage?.querySelector(
      '.split-dialogue-more',
    ) as HTMLElement | null;
    const dialogueLines = [
      ...(morePage?.querySelectorAll(
        '.script-preview-page-body > p.dialogue',
      ) ?? []),
    ];
    const lastDialogueLine = dialogueLines.at(-1) as HTMLElement | undefined;
    const lastDialogueBottom =
      parseFloat(lastDialogueLine?.style.top ?? '0') + 12;

    expect(moreMarker?.textContent).toBe('(MORE)');
    expect(parseFloat(moreMarker?.style.top ?? '0')).toBe(lastDialogueBottom);
  });

  it('keeps the last dialogue line above the (MORE) footer on split pages', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. LOFT - DAY' },
      ...Array.from({ length: 19 }, (_, index) => [
        {
          type: 'action' as const,
          text: `Action line ${index + 1}.`,
        },
        {
          type: 'action' as const,
          text: '',
        },
      ]).flat(),
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: longDialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );
    const morePage = [
      ...container.querySelectorAll('.script-preview-page'),
    ].find((page) => page.querySelector('.split-dialogue-more'));
    const dialogueLines = [
      ...(morePage?.querySelectorAll(
        '.script-preview-page-body > p.dialogue',
      ) ?? []),
    ];
    const lastDialogueLine = dialogueLines.at(-1) as HTMLElement | undefined;
    const pageBodyHeight = getPageLayout('us-letter').contentHeightPt;

    expect(lastDialogueLine).toBeDefined();

    const lastDialogueBottom =
      parseFloat(lastDialogueLine?.style.top ?? '0') + 12;

    expect(lastDialogueBottom).toBeLessThanOrEqual(pageBodyHeight - 12);
    expect(dialogueLines.length).toBeGreaterThan(0);
  });

  it('renders russell dialogue above (MORE) on a tight page', () => {
    const guillermo =
      "Son. Woods senior died a couple of years ago. Fitz's been working in his place since the old man got sick.";
    const russell =
      '"Sick." People who pick this line of work got one option down the road: (a beat) Most people don\'t see the time to wind down, is all.';
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. CAR - DAY' },
      ...Array.from({ length: 47 }, (_, index) => [
        {
          type: 'action' as const,
          text: `Action line ${index + 1}.`,
        },
        {
          type: 'action' as const,
          text: '',
        },
      ]).flat(),
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: guillermo },
      { type: 'character', text: 'RUSSELL' },
      { type: 'parenthetical', text: '(chuckles, then...)' },
      { type: 'dialogue', text: russell },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );
    const morePage = [
      ...container.querySelectorAll('.script-preview-page'),
    ].find((page) => page.querySelector('.split-dialogue-more'));
    const russellLines = [
      ...(morePage?.querySelectorAll(
        '.script-preview-page-body > p.dialogue',
      ) ?? []),
    ].filter((line) => line.textContent?.includes('Sick.'));

    expect(russellLines.length).toBeGreaterThan(0);
  });

  it('positions split-dialogue continuation one line below the repeated cue', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. LOFT - DAY' },
      ...Array.from({ length: 19 }, (_, index) => [
        {
          type: 'action' as const,
          text: `Action line ${index + 1}.`,
        },
        {
          type: 'action' as const,
          text: '',
        },
      ]).flat(),
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: longDialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );
    const pages = [...container.querySelectorAll('.script-preview-page')];
    const morePageIndex = pages.findIndex((page) =>
      page.querySelector('.split-dialogue-more'),
    );
    const continuationPage = pages[morePageIndex + 1];
    const cue = continuationPage?.querySelector('p.character');
    const dialogue = continuationPage?.querySelector('p.dialogue');

    expect(cue).toBeDefined();
    expect(dialogue).toBeDefined();
    const cueTop = parseFloat((cue as HTMLElement).style.top ?? '0');
    const dialogueTop = parseFloat((dialogue as HTMLElement).style.top ?? '0');

    expect(cueTop).toBeLessThan(dialogueTop);
    expect(dialogueTop).toBe(cueTop + 12);
  });

  it("does not place (CONT'D) on the same page as (MORE)", () => {
    const dialogue = [
      ...Array.from(
        { length: 12 },
        (_, index) =>
          `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
      ),
      "If you shoot me, the least that's gonna happen to you is a crash, what happens when the boss finds out you let him die? You're not gonna shoot me.",
    ].join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. CAR - DAY' },
      ...Array.from({ length: 19 }, (_, index) => [
        { type: 'action' as const, text: `Action line ${index + 1}.` },
        { type: 'action' as const, text: '' },
      ]).flat(),
      { type: 'action', text: '-- Mario whips out his gun at Guillermo.' },
      { type: 'character', text: 'GUILLERMO' },
      { type: 'dialogue', text: dialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );
    const pages = [...container.querySelectorAll('.script-preview-page')];
    const morePage = pages.find((page) =>
      page.querySelector('.split-dialogue-more'),
    );
    const contdOnMorePage = [
      ...(morePage?.querySelectorAll(
        '.script-preview-page-body > p.character',
      ) ?? []),
    ].filter((line) => line.textContent?.includes("(CONT'D)"));

    expect(contdOnMorePage).toHaveLength(0);
  });

  it('assigns unique vertical positions to every flow line on each page', () => {
    const longDialogue = Array.from(
      { length: 12 },
      (_, index) =>
        `Dialogue segment ${index + 1} carries enough words to wrap inside the narrower dialogue column.`,
    ).join(' ');
    const bodyBlocks: ScriptBlock[] = [
      { type: 'sceneHeading', text: 'INT. LOFT - DAY' },
      ...Array.from({ length: 19 }, (_, index) => [
        {
          type: 'action' as const,
          text: `Action line ${index + 1}.`,
        },
        {
          type: 'action' as const,
          text: '',
        },
      ]).flat(),
      { type: 'character', text: 'MARA' },
      { type: 'dialogue', text: longDialogue },
    ];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        titlePageLines={[]}
      />,
    );

    for (const page of container.querySelectorAll('.script-preview-page')) {
      const flowLines = [
        ...page.querySelectorAll('.script-preview-page-body > p'),
      ];
      const tops = flowLines.map((line) =>
        parseFloat((line as HTMLElement).style.top ?? '0'),
      );

      expect(new Set(tops).size).toBe(tops.length);
    }
  });

  it('sets page format and typeface data attributes on the preview stack', () => {
    const bodyBlocks: ScriptBlock[] = [{ type: 'action', text: 'Hello.' }];
    const { blocks, pagination } = paginateForPreview(bodyBlocks);

    const { container } = render(
      <ScriptPreviewView
        blocks={blocks}
        pagination={pagination}
        pageFormat="a4"
        typeface="courier-new"
        titlePageLines={[]}
      />,
    );
    const stack = container.querySelector('.script-preview-stack');

    expect(stack).toHaveAttribute('data-page-format', 'a4');
    expect(stack).toHaveAttribute('data-typeface', 'courier-new');
  });
});
