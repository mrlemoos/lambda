import type { PaginationResult, ScriptBlock } from './types';

export const CONTD_ANNOTATION = "(CONT'D)";

export function stripContdAnnotation(text: string): string {
  return text.replace(/\s*\(CONT'D\)\s*/gi, '').trimEnd();
}

function characterIdentity(text: string): string {
  return stripContdAnnotation(text).trim();
}

export function annotateCharacterContd(text: string): string {
  const baseText = stripContdAnnotation(text);

  if (baseText.length === 0) {
    return text;
  }

  return `${baseText} ${CONTD_ANNOTATION}`;
}

function findPrecedingCharacter(
  blocks: ScriptBlock[],
  dialogueIndex: number,
): ScriptBlock | undefined {
  for (let index = dialogueIndex - 1; index >= 0; index -= 1) {
    const block = blocks[index];

    if (block.type === 'character') {
      return block;
    }

    if (block.type !== 'parenthetical') {
      break;
    }
  }

  return undefined;
}

function speechClusterEndIndex(
  blocks: ScriptBlock[],
  characterIndex: number,
): number {
  let endIndex = characterIndex;

  while (blocks[endIndex + 1]?.type === 'parenthetical') {
    endIndex += 1;
  }

  if (blocks[endIndex + 1]?.type === 'dialogue') {
    endIndex += 1;
  }

  return endIndex;
}

function hasSubstantiveInterveningAction(
  blocks: ScriptBlock[],
  afterIndex: number,
  beforeIndex: number,
): boolean {
  for (let index = afterIndex + 1; index < beforeIndex; index += 1) {
    if (
      blocks[index].type === 'action' &&
      blocks[index].text.trim().length > 0
    ) {
      return true;
    }
  }

  return false;
}

function hasInterveningOtherSpeaker(
  blocks: ScriptBlock[],
  afterIndex: number,
  beforeIndex: number,
  speakerIdentity: string,
): boolean {
  for (let index = afterIndex + 1; index < beforeIndex; index += 1) {
    const block = blocks[index];

    if (block.type === 'character') {
      if (characterIdentity(block.text) !== speakerIdentity) {
        return true;
      }

      continue;
    }

    if (block.type === 'dialogue') {
      const speaker = findPrecedingCharacter(blocks, index);

      if (speaker && characterIdentity(speaker.text) !== speakerIdentity) {
        return true;
      }
    }
  }

  return false;
}

function shouldAnnotateSceneContinuityContd(
  blocks: ScriptBlock[],
  characterIndex: number,
  lastSpeechEndByCharacter: Map<string, number>,
): boolean {
  const speakerIdentity = characterIdentity(blocks[characterIndex].text);
  const previousSpeechEnd = lastSpeechEndByCharacter.get(speakerIdentity);

  if (previousSpeechEnd === undefined) {
    return false;
  }

  if (
    hasInterveningOtherSpeaker(
      blocks,
      previousSpeechEnd,
      characterIndex,
      speakerIdentity,
    )
  ) {
    return false;
  }

  return hasSubstantiveInterveningAction(
    blocks,
    previousSpeechEnd,
    characterIndex,
  );
}

export function enrichBlocks(
  rawBlocks: ScriptBlock[],
  firstPassResult: PaginationResult,
): ScriptBlock[] {
  const enrichedBlocks: ScriptBlock[] = [];
  const lastSpeechEndByCharacter = new Map<string, number>();

  for (let index = 0; index < rawBlocks.length; index += 1) {
    const block = rawBlocks[index];

    if (block.type === 'sceneHeading') {
      lastSpeechEndByCharacter.clear();
    }

    if (block.type === 'character') {
      const strippedBlock = {
        ...block,
        text: stripContdAnnotation(block.text),
      };
      const characterBlock = shouldAnnotateSceneContinuityContd(
        rawBlocks,
        index,
        lastSpeechEndByCharacter,
      )
        ? {
            ...strippedBlock,
            text: annotateCharacterContd(strippedBlock.text),
          }
        : strippedBlock;

      enrichedBlocks.push(characterBlock);
      continue;
    }

    if (
      block.type === 'dialogue' &&
      firstPassResult.placements[index]?.pageStarts?.length
    ) {
      const characterBlock = findPrecedingCharacter(rawBlocks, index);

      if (characterBlock) {
        enrichedBlocks.push({
          type: 'splitDialogueCharacter',
          text: annotateCharacterContd(characterBlock.text),
        });
      }
    }

    enrichedBlocks.push(block);

    if (block.type === 'dialogue') {
      for (let charIndex = index - 1; charIndex >= 0; charIndex -= 1) {
        const candidate = rawBlocks[charIndex];

        if (candidate.type === 'character') {
          lastSpeechEndByCharacter.set(
            characterIdentity(candidate.text),
            speechClusterEndIndex(rawBlocks, charIndex),
          );
          break;
        }

        if (candidate.type !== 'parenthetical') {
          break;
        }
      }
    }
  }

  return enrichedBlocks;
}

export function collapseEnrichedPlacements(
  enrichedBlocks: ScriptBlock[],
  enrichedPlacements: PaginationResult['placements'],
): PaginationResult['placements'] {
  const collapsed: PaginationResult['placements'] = [];

  for (let index = 0; index < enrichedBlocks.length; index += 1) {
    const block = enrichedBlocks[index];

    if (block.type === 'splitDialogueCharacter') {
      continue;
    }

    if (
      block.type === 'dialogue' &&
      enrichedBlocks[index - 1]?.type === 'splitDialogueCharacter'
    ) {
      const splitPlacement = enrichedPlacements[index - 1];

      collapsed.push({
        ...enrichedPlacements[index],
        splitDialogueCharacter: {
          text: enrichedBlocks[index - 1].text,
          topOffsetPt: splitPlacement.topOffsetPt,
          marginTopPt: splitPlacement.marginTopPt,
        },
      });
      continue;
    }

    collapsed.push(enrichedPlacements[index]);
  }

  return collapsed;
}
