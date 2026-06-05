import type { Editor } from '@tiptap/core';
import { useEffect, useState } from 'react';

import type { PageFormat } from '../ScriptEditor';
import { paginateScript } from './paginateScript';
import { serializeTipTapDocument } from './serializeTipTapDocument';
import type { PaginationResult } from './types';

const EMPTY_PAGINATION = (pageFormat: PageFormat): PaginationResult => ({
  pages: [{ number: 1, topOffsetPt: 0 }],
  boundaries: [],
  totalHeightPt: 0,
  pageFormat,
});

export function useScriptPagination(
  editor: Editor | null,
  pageFormat: PageFormat,
): PaginationResult {
  const [pagination, setPagination] = useState<PaginationResult>(() =>
    EMPTY_PAGINATION(pageFormat),
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    const update = () => {
      const blocks = serializeTipTapDocument(editor.getJSON());

      setPagination(paginateScript(blocks, pageFormat));
    };

    update();
    editor.on('update', update);

    return () => {
      editor.off('update', update);
    };
  }, [editor, pageFormat]);

  return pagination;
}
