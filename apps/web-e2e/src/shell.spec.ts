import { expect, test } from '@playwright/test';

import {
  clickEditMenuItem,
  clickFileMenuItem,
  expectFountainText,
  getFountainText,
  loadFixture,
  pressEnter,
  readExpected,
  startNewScript,
} from './helpers';

test.describe('shell smokes', () => {
  test('S1: welcome new script serialises to the new-script stub', async ({
    page,
  }) => {
    await startNewScript(page);

    await expectFountainText(page, readExpected('new-script'));
  });

  test('S2: edited fixture shows unsaved modal when returning to welcome', async ({
    page,
  }) => {
    await loadFixture(page, 'minimal');
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('Edited');

    await page.getByRole('link', { name: '← Welcome' }).click();

    await expect(
      page.getByText('Save changes to this script before continuing?'),
    ).toBeVisible();
  });

  test('S3: save after edit writes the golden fountain text', async ({
    page,
  }) => {
    await loadFixture(page, 'minimal');
    const editor = page.locator('.ProseMirror');

    await editor.click();
    await page.locator('.ProseMirror p').last().click();
    await page.keyboard.press('End');
    await pressEnter(page);
    await page.keyboard.type('Edited line for save.');

    await page.waitForFunction(() =>
      window.__lambdaE2e!.getFountainText().includes('Edited line for save.'),
    );

    await expectFountainText(page, readExpected('shell-save'));

    await clickFileMenuItem(page, 'Save');

    const written = await page.evaluate(() =>
      window.__lambdaE2e!.getLastWrittenContents(),
    );

    expect(written).toBe(readExpected('shell-save'));
    await expectFountainText(page, readExpected('shell-save'));
  });

  test('S4: undo via application menu reverts serialised text', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Undo smoke runs on Chromium only');

    await loadFixture(page, 'minimal');
    const beforeEdit = await getFountainText(page);

    await page.locator('.ProseMirror').click();
    await page.keyboard.type('Temporary edit');

    await clickEditMenuItem(page, 'Undo');

    await expectFountainText(page, beforeEdit);
  });
});
