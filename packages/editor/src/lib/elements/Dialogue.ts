import { isCharacter } from './Character';
import { isParenthetical } from './Parenthetical';
import { isSceneHeading } from './SceneHeading';
import { isTransition } from './Transition';

export function isDialogue(text: string, previousLine?: string): boolean {
  if (text.length === 0 || typeof previousLine !== 'string') {
    return false;
  }

  if (isSceneHeading(previousLine) || isTransition(previousLine)) {
    return false;
  }

  return isCharacter(previousLine) || isParenthetical(previousLine);
}
