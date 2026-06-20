import { expect, test } from '@playwright/test';

import { expectFountainText, loadFixture, readFixture } from '../helpers';

test('loads parity-pagination-heavy without fountain loss', async ({
  page,
}) => {
  const fixture = readFixture('parity-pagination-heavy');

  await loadFixture(page, 'parity-pagination-heavy');

  await expectFountainText(page, fixture);
});

test('shows pagination chrome for heavy scripts', async ({ page }) => {
  await loadFixture(page, 'parity-pagination-heavy');

  await expect(page.locator('.script-page-boundary')).not.toHaveCount(0);
  await expect(page.locator('.script-page-number')).not.toHaveCount(0);
});

test('loads parity-split-dialogue without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-split-dialogue');

  await loadFixture(page, 'parity-split-dialogue');

  await expectFountainText(page, fixture);
});

test('shows split-dialogue continuation chrome when dialogue spans pages', async ({
  page,
}) => {
  await loadFixture(page, 'parity-split-dialogue');

  await expect(page.locator('.script-page-boundary')).not.toHaveCount(0);
  await expect(page.getByText("(CONT'D)")).not.toHaveCount(0);
});
