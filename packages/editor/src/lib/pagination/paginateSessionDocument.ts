import type { JSONContent } from '@tiptap/core';

import type { PageFormat, ScriptTypeface } from '../ScriptEditor';
import { collapseEnrichedPlacements, enrichBlocks } from './enrichBlocks';
import { paginateScript } from './paginateScript';
import { serializeTipTapDocument } from './serializeTipTapDocument';
import { titlePageBlocks } from './titlePageBlocks';
import type { PaginationResult, ScriptBlock } from './types';

export type PaginateSessionDocumentInput = {
  document: JSONContent;
  titlePageLines: string[];
  pageFormat: PageFormat;
  typeface: ScriptTypeface;
};

export type PaginateSessionDocumentResult = {
  blocks: ScriptBlock[];
  pagination: PaginationResult;
};

export function paginateSessionDocument({
  document,
  titlePageLines,
  pageFormat,
  typeface,
}: PaginateSessionDocumentInput): PaginateSessionDocumentResult {
  const blocks = [
    ...titlePageBlocks(titlePageLines),
    ...serializeTipTapDocument(document),
  ];
  const firstPass = paginateScript(blocks, pageFormat, typeface);
  const enrichedBlocks = enrichBlocks(blocks, firstPass);
  const finalPass = paginateScript(enrichedBlocks, pageFormat, typeface);
  const placements = collapseEnrichedPlacements(
    enrichedBlocks,
    finalPass.placements,
  );
  const previewBlocks = enrichedBlocks.filter(
    (block) => block.type !== 'splitDialogueCharacter',
  );

  return {
    blocks: previewBlocks,
    pagination: {
      ...finalPass,
      placements,
      hasTitlePage: titlePageLines.length > 0,
    },
  };
}
