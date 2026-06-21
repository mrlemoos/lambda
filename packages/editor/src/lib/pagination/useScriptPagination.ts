import type { Editor } from '@tiptap/core';
import { useEffect, useRef, useState } from 'react';

import type { PageFormat, ScriptTypeface } from '../ScriptEditor';
import { DEFAULT_SCRIPT_TYPEFACE } from './elementMetrics';
import { getPageLayout } from './pageLayout';
import { collapseEnrichedPlacements, enrichBlocks } from './enrichBlocks';
import { paginateScript } from './paginateScript';
import { paginationLayoutPluginKey } from './paginationLayoutExtension';
import { serializeTipTapDocument } from './serializeTipTapDocument';
import { titlePageBlocks } from './titlePageBlocks';
import type { BlockPlacement, PaginationResult } from './types';

const EMPTY_TITLE_PAGE_LINES: string[] = [];

const EMPTY_PAGINATION = (pageFormat: PageFormat): PaginationResult => {
  const layout = getPageLayout(pageFormat);

  return {
    pages: [{ number: 1, topOffsetPt: 0 }],
    boundaries: [],
    placements: [],
    totalHeightPt: layout.contentHeightPt,
    pageFormat,
  };
};

function placementsEqual(
  left: BlockPlacement[] | null,
  right: BlockPlacement[],
): boolean {
  if (!left || left.length !== right.length) {
    return false;
  }

  return left.every(
    (placement, index) =>
      placement.marginTopPt === right[index]?.marginTopPt &&
      placement.topOffsetPt === right[index]?.topOffsetPt,
  );
}

export function useScriptPagination(
  editor: Editor | null,
  pageFormat: PageFormat,
  typeface: ScriptTypeface = DEFAULT_SCRIPT_TYPEFACE,
  titlePageLines: string[] = EMPTY_TITLE_PAGE_LINES,
): PaginationResult {
  const [pagination, setPagination] = useState<PaginationResult>(() =>
    EMPTY_PAGINATION(pageFormat),
  );
  const lastPlacementsRef = useRef<BlockPlacement[] | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const runPagination = () => {
      const blocks = [
        ...titlePageBlocks(titlePageLines),
        ...serializeTipTapDocument(editor.getJSON()),
      ];
      const firstPass = paginateScript(blocks, pageFormat, typeface);
      const enrichedBlocks = enrichBlocks(blocks, firstPass);
      const finalPass = paginateScript(enrichedBlocks, pageFormat, typeface);
      const placements = collapseEnrichedPlacements(
        enrichedBlocks,
        finalPass.placements,
      );
      const result = {
        ...finalPass,
        placements,
      };

      setPagination({
        ...result,
        hasTitlePage: titlePageLines.length > 0,
      });

      if (placementsEqual(lastPlacementsRef.current, result.placements)) {
        return;
      }

      lastPlacementsRef.current = result.placements;

      if (!editor.isDestroyed && editor.view) {
        editor.view.dispatch(
          editor.state.tr.setMeta(paginationLayoutPluginKey, result.placements),
        );
      }
    };

    runPagination();

    const handleUpdate = ({
      transaction,
    }: {
      transaction: { docChanged: boolean };
    }) => {
      if (!transaction.docChanged) {
        return;
      }

      runPagination();
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      lastPlacementsRef.current = null;
    };
  }, [editor, pageFormat, typeface, titlePageLines]);

  return pagination;
}
