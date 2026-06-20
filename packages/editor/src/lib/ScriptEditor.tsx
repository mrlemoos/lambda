import type { ReactNode } from 'react';

import { ScriptPageChrome } from './pagination/ScriptPageChrome';
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
  pagination,
}: ScriptEditorProps) {
  return (
    <div data-page-format={pageFormat}>
      <div className="script-page">
        {pagination ? <ScriptPageChrome pagination={pagination} /> : null}
        <div className="script-page-body">{children}</div>
      </div>
    </div>
  );
}
