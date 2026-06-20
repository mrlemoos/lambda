import { test } from '@playwright/test';

import { expectFountainText, loadFixture, readFixture } from '../helpers';

test('loads parity-centered-lyrics without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-centered-lyrics');

  await loadFixture(page, 'parity-centered-lyrics');

  await expectFountainText(page, fixture);
});

test('loads parity-dual-dialogue without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-dual-dialogue');

  await loadFixture(page, 'parity-dual-dialogue');

  await expectFountainText(page, fixture);
});

test('loads parity-scene-numbers without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-scene-numbers');

  await loadFixture(page, 'parity-scene-numbers');

  await expectFountainText(page, fixture);
});

test('loads parity-page-break without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-page-break');

  await loadFixture(page, 'parity-page-break');

  await expectFountainText(page, fixture);
});

test('loads parity-boneyard without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-boneyard');

  await loadFixture(page, 'parity-boneyard');

  await expectFountainText(page, fixture);
});

test('loads parity-note-tags without fountain loss', async ({ page }) => {
  const fixture = readFixture('parity-note-tags');

  await loadFixture(page, 'parity-note-tags');

  await expectFountainText(page, fixture);
});
