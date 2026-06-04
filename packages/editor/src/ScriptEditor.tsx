import type { ReactNode } from 'react';

import './styles.css';

export type PageFormat = 'us-letter' | 'a4';

export type ScriptEditorProps = {
  children?: ReactNode;
  pageFormat?: PageFormat;
};

export function ScriptEditor({
  children,
  pageFormat = 'us-letter',
}: ScriptEditorProps) {
  return (
    <div data-page-format={pageFormat}>
      <div className="script-page">{children}</div>
    </div>
  );
}
