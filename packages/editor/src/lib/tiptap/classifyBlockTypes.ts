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
