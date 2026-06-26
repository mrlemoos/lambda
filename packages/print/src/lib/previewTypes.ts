import type {
  BodyScriptElementType,
  ScriptBlock,
  ScriptElementType,
} from '@lambda/editor';

export type PreviewElementType =
  | BodyScriptElementType
  | 'splitDialogueCharacter'
  | 'splitDialogueMore';

export const SPLIT_DIALOGUE_MORE_ANNOTATION = '(MORE)';

export type PreviewFragment = {
  elementType: PreviewElementType;
  text: string;
  /** Vertical offset within the page content area (pagination pt). */
  topOffsetPt: number;
  /** Flow margin before this fragment, derived from pagination offsets. */
  marginTopPt?: number;
  /** Cap wrapped rows to pagination line budget (split-dialogue page before MORE). */
  paginationLineCount?: number;
};

export type PreviewPageKind = 'title' | 'body';

export type PreviewPage = {
  kind: PreviewPageKind;
  pageNumber?: number;
  /** Body-page content origin in document vertical pt space. */
  contentTopOffsetPt?: number;
  fragments: PreviewFragment[];
};

export type PreviewPagesModel = {
  pages: PreviewPage[];
  hasTitlePage: boolean;
};

const OUTLINE_ELEMENT_TYPES = new Set<ScriptElementType>([
  'section',
  'synopsis',
  'note',
]);

const HIDDEN_ELEMENT_TYPES = new Set<ScriptElementType>([
  'titlePage',
  'pageBreak',
  'splitDialogueCharacter',
]);

export function isPreviewVisibleBlock(block: ScriptBlock): boolean {
  if (OUTLINE_ELEMENT_TYPES.has(block.type)) {
    return false;
  }

  if (HIDDEN_ELEMENT_TYPES.has(block.type)) {
    return false;
  }

  if ((block.type as string) === 'omission') {
    return false;
  }

  return true;
}

export function previewElementClassName(
  elementType: PreviewElementType,
): string {
  switch (elementType) {
    case 'centeredText':
      return 'centered-text';
    case 'sceneHeading':
      return 'scene-heading';
    case 'splitDialogueCharacter':
      return 'character';
    case 'splitDialogueMore':
      return 'split-dialogue-more';
    default:
      return elementType;
  }
}

export function previewFragmentClassName(
  elementType: PreviewElementType,
  text: string,
): string {
  if (elementType === 'splitDialogueMore') {
    return previewElementClassName(elementType);
  }

  const className = previewElementClassName(elementType);

  return text.length === 0
    ? `${className} script-preview-blank-line`
    : className;
}
