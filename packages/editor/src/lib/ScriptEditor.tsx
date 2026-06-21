import type { ReactNode } from 'react';

import { ScriptPageChrome } from './pagination/ScriptPageChrome';
import type { PaginationResult } from './pagination/types';

import './styles.css';

export type PageFormat = 'us-letter' | 'a4';
export type ScriptTypeface = 'courier-prime' | 'courier-new' | 'monospace';

export type ScriptEditorProps = {
  children?: ReactNode;
  pageFormat?: PageFormat;
  typeface?: ScriptTypeface;
  pagination?: PaginationResult;
};

export function ScriptEditor({
  children,
  pageFormat = 'us-letter',
  typeface = 'courier-prime',
  pagination,
}: ScriptEditorProps) {
  return (
    <div data-page-format={pageFormat} data-typeface={typeface}>
      <div className="script-page">
        {pagination ? <ScriptPageChrome pagination={pagination} /> : null}
        <div className="script-page-body">{children}</div>
      </div>
    </div>
  );
}
