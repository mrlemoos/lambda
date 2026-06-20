import type { ClassifiedElement } from '../ClassifyLine';

export function classifiedToNodeType(
  classified: ClassifiedElement | null,
): string {
  switch (classified) {
    case 'scene-heading':
      return 'sceneHeading';
    case 'section':
      return 'section';
    case 'synopsis':
      return 'synopsis';
    case 'note':
      return 'note';
    case 'centered-text':
      return 'centeredText';
    case 'character':
      return 'character';
    case 'parenthetical':
      return 'parenthetical';
    case 'dialogue':
      return 'dialogue';
    case 'transition':
      return 'transition';
    default:
      return 'action';
  }
}

/** Empty action blocks inserted before the next block when Enter is pressed. */
export function enterActionSpacerCount(
  classified: ClassifiedElement | null,
): number {
  switch (classified) {
    case 'scene-heading':
    case 'action':
    case 'dialogue':
    case 'transition':
      return 2;
    case 'character':
    case 'parenthetical':
    default:
      return 0;
  }
}

/** Fountain block that typically follows the line the user just finished. */
export function classifiedToNextBlockType(
  classified: ClassifiedElement | null,
): string {
  switch (classified) {
    case 'character':
    case 'parenthetical':
      return 'dialogue';
    case 'dialogue':
      return 'action';
    default:
      return 'action';
  }
}
