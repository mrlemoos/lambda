import type { ScriptBlock } from './types';

export function titlePageBlocks(lines: string[]): ScriptBlock[] {
  if (lines.length === 0) {
    return [];
  }

  return [{ type: 'titlePage', text: lines.join('\n') }];
}
