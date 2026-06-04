import { describe, expect, it } from 'vitest';

import { classifyLine } from './ClassifyLine';

describe('classifyLine', () => {
  it('classifies scene headings before transitions', () => {
    const line = 'INT. KITCHEN - DAY';

    const result = classifyLine(line);

    expect(result).toBe('scene-heading');
  });

  it.each([
    ['# Act I', 'section'],
    ['= Setup the story.', 'synopsis'],
    ['[[Todo: fix later]]', 'note'],
    ['Title: BRICK & STEEL', 'title-page'],
  ])('classifies %s as %s', (line, expected) => {
    const result = classifyLine(line);

    expect(result).toBe(expected);
  });

  it('classifies indented title page line using previous line', () => {
    const line = '    Time Chef 2';
    const previousLine = 'Title:';

    const result = classifyLine(line, previousLine);

    expect(result).toBe('title-page');
  });

  it.each([
    ['Draft date: 1/20/2012', 'title-page'],
    ['CUT TO:', 'transition'],
  ])('classifies title page before transitions: %s', (line, expected) => {
    const result = classifyLine(line);

    expect(result).toBe(expected);
  });

  it.each([
    ['CUT TO:', 'transition'],
    ['> FADE TO BLACK.', 'transition'],
  ])('classifies %s as %s', (line, expected) => {
    const result = classifyLine(line);

    expect(result).toBe(expected);
  });

  it.each([
    ['STEEL', 'character'],
    ['BRICK (O.S.)', 'character'],
    ['@McCLANE', 'character'],
  ])('classifies %s as %s', (line, expected) => {
    const result = classifyLine(line);

    expect(result).toBe(expected);
  });

  it.each([
    ['(starting the engine)', 'parenthetical'],
    ['(pause)', 'parenthetical'],
  ])('classifies %s as %s', (line, expected) => {
    const result = classifyLine(line);

    expect(result).toBe(expected);
  });

  it('classifies dialogue using the previous character line', () => {
    const line = 'Luke. Search your feelings.';
    const previousLine = 'DARTH VADER';

    const result = classifyLine(line, previousLine);

    expect(result).toBe('dialogue');
  });

  it('classifies dialogue using the previous parenthetical line', () => {
    const line = 'Hit or stand sir?';
    const previousLine = '(pause)';

    const result = classifyLine(line, previousLine);

    expect(result).toBe('dialogue');
  });

  it('classifies standalone dialogue-shaped line as action', () => {
    const line = 'Luke. Search your feelings.';

    const result = classifyLine(line);

    expect(result).toBe('action');
  });

  it('classifies plain action lines', () => {
    const line = 'They drink long and well from the beers.';

    const result = classifyLine(line);

    expect(result).toBe('action');
  });

  it('classifies forced action after scene heading', () => {
    const line = '!SCANNING THE AISLES…';
    const previousLine = 'INT. CASINO - NIGHT';

    const result = classifyLine(line, previousLine);

    expect(result).toBe('action');
  });
});
