const SCENE_HEADING_PREFIX =
  /^(?:INT\.?\/EXT\.?|INT\.?|EXT\.?|EST\.?|I\/E\.?)[\s.]/i;

const FORCED_SCENE_HEADING = /^\.[A-Za-z0-9]/;

export function isSceneHeading(text: string): boolean {
  if (SCENE_HEADING_PREFIX.test(text)) {
    return true;
  }

  return FORCED_SCENE_HEADING.test(text);
}
