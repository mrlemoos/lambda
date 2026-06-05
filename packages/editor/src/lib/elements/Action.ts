import { isCenteredText } from './CenteredText';
import { isCharacter } from './Character';
import { isDialogue } from './Dialogue';
import { isNote } from './Note';
import { isParenthetical } from './Parenthetical';
import { isSceneHeading } from './SceneHeading';
import { isSection } from './Section';
import { isSynopsis } from './Synopsis';
import { isTitlePage } from './TitlePage';
import { isTransition } from './Transition';

export function isAction(text: string, previousLine?: string): boolean {
  if (text.trim().length === 0) {
    return false;
  }

  if (isSceneHeading(text)) {
    return false;
  }

  if (isSection(text)) {
    return false;
  }

  if (isSynopsis(text)) {
    return false;
  }

  if (isNote(text)) {
    return false;
  }

  if (isCenteredText(text)) {
    return false;
  }

  if (isTitlePage(text, previousLine)) {
    return false;
  }

  if (isTransition(text)) {
    return false;
  }

  if (isCharacter(text)) {
    return false;
  }

  if (isParenthetical(text)) {
    return false;
  }

  if (isDialogue(text, previousLine)) {
    return false;
  }

  return true;
}
