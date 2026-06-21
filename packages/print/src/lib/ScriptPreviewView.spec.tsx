import { render, screen } from '@testing-library/react';
import {
  collapseEnrichedPlacements,
  enrichBlocks,
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
