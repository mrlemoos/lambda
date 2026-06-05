import { isAction } from './elements/Action';
import { isCenteredText } from './elements/CenteredText';
import { isCharacter } from './elements/Character';
import { isDialogue } from './elements/Dialogue';
import { isNote } from './elements/Note';
import { isParenthetical } from './elements/Parenthetical';
import { isSceneHeading } from './elements/SceneHeading';
import { isSection } from './elements/Section';
import { isSynopsis } from './elements/Synopsis';
import { isTitlePage } from './elements/TitlePage';
import { isTransition } from './elements/Transition';

export type ClassifiedElement =
  | 'scene-heading'
  | 'section'
  | 'synopsis'
  | 'note'
  | 'centered-text'
  | 'title-page'
  | 'transition'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'action';

export function classifyLine(
  text: string,
  previousLine?: string,
): ClassifiedElement | null {
  if (isSceneHeading(text)) {
    return 'scene-heading';
  }

  if (isSection(text)) {
    return 'section';
  }

  if (isSynopsis(text)) {
    return 'synopsis';
  }

  if (isNote(text)) {
    return 'note';
  }

  if (isCenteredText(text)) {
    return 'centered-text';
  }

  if (isTitlePage(text, previousLine)) {
    return 'title-page';
  }

  if (isTransition(text)) {
    return 'transition';
  }

  if (isCharacter(text)) {
    return 'character';
  }

  if (isParenthetical(text)) {
    return 'parenthetical';
  }

  if (isDialogue(text, previousLine)) {
    return 'dialogue';
  }

  if (isAction(text, previousLine)) {
    return 'action';
  }

  return null;
}
