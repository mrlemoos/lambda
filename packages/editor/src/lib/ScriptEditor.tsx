import type { ReactNode } from 'react';

import type { PaginationResult } from './pagination/types';

import './styles.css';

export type PageFormat = 'us-letter' | 'a4';

export type ScriptEditorProps = {
  children?: ReactNode;
  pageFormat?: PageFormat;
  pagination?: PaginationResult;
};

export function ScriptEditor({
  children,
  pageFormat = 'us-letter',
  pagination: _pagination,
}: ScriptEditorProps) {
  void _pagination;

  return (
    <div data-page-format={pageFormat}>
      <div className="script-page">
        <div className="script-page-body">{children}</div>
      </div>
    </div>
  );
}
