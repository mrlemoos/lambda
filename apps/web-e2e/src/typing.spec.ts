import { expect, test } from '@playwright/test';

import {
  expectFountainText,
  loadFixture,
  pressEnter,
  readExpected,
  startNewScript,
} from './helpers';

test.describe('typing scenarios', () => {
  test('T1: scene exchange from blank script', async ({ page }) => {
    await startNewScript(page);
    const editor = page.locator('.ProseMirror');

    await editor.click();
    await page.keyboard.type('INT. KITCHEN - DAY');
    await pressEnter(page);
    await page.keyboard.type('Some action line goes here...');
    await pressEnter(page);
    await page.keyboard.type('CHARACTER NAME');
    await pressEnter(page);
    await page.keyboard.type('This is a line of dialogue.');

    await expectFountainText(page, readExpected('typing-scene-exchange'));
  });

  test('T2: append action line after bootstrapping minimal fixture', async ({
    page,
  }) => {
    await loadFixture(page, 'minimal');
    const editor = page.locator('.ProseMirror');

    await editor.click();
    await page.locator('.ProseMirror p').last().click();
    await page.keyboard.press('End');
    await pressEnter(page);
    await page.keyboard.type('Appended action line.');

    await expectFountainText(page, readExpected('typing-append-action'));
  });

  test('T3: forced scene heading shows forced-prefix styling', async ({
    page,
  }) => {
    await startNewScript(page);
    const editor = page.locator('.ProseMirror');

    await editor.click();
    await page.keyboard.type('.SNIPER SCOPE POV');
    await pressEnter(page);

    await expectFountainText(page, readExpected('typing-forced-scene-heading'));
    await expect(page.locator('.forced-prefix')).toHaveCount(1);
  });
});
