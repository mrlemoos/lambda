import { isSceneHeading } from './elements/SceneHeading';

export type ClassifiedElement = 'scene-heading';

export function classifyLine(text: string): ClassifiedElement | null {
  if (isSceneHeading(text)) {
    return 'scene-heading';
  }

  return null;
}
