import { expect, test } from '@playwright/test';

import { expectFountainText, loadFixture, readFixture } from '../helpers';

test('loads parity-slugline-settings without fountain loss', async ({
  page,
}) => {
  const fixture = readFixture('parity-slugline-settings');

  await loadFixture(page, 'parity-slugline-settings');

  await expectFountainText(page, fixture);
});

test('hides slugline settings block in the editor surface', async ({
  page,
}) => {
  await loadFixture(page, 'parity-slugline-settings');

  await expect(page.getByText('Slugline Document Settings')).not.toBeVisible();
});

test('loads parity-a4 without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-a4');

  await loadFixture(page, 'parity-a4');

  await expectFountainText(page, fixture);
});

test('uses a4 page format when slugline settings request it', async ({
  page,
}) => {
  await loadFixture(page, 'parity-a4');

  await expect(page.locator('[data-page-format="a4"]')).toHaveCount(1);
});
