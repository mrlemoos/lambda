import type { PageFormat } from '../ScriptEditor';

export type BodyScriptElementType =
  | 'action'
  | 'sceneHeading'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition';

export type OutlineElementType = 'section' | 'synopsis' | 'note';

export type SpecialElementType =
  | 'titlePage'
  | 'pageBreak'
  | 'splitDialogueCharacter';

export type ScriptElementType =
  | BodyScriptElementType
  | OutlineElementType
  | SpecialElementType;

export type ScriptBlock = {
  type: ScriptElementType;
  text: string;
};

export type BlockPlacement = {
  /** Extra space before this block so it clears the page boundary. */
  marginTopPt: number;
  topOffsetPt: number;
};

export type ScriptPage = {
  number: number;
  topOffsetPt: number;
};

export type PageBoundary = {
  offsetPt: number;
};

export type PaginationResult = {
  pages: ScriptPage[];
  boundaries: PageBoundary[];
  placements: BlockPlacement[];
  totalHeightPt: number;
  pageFormat: PageFormat;
};
