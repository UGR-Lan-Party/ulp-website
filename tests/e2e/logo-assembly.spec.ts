import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('el logo se monta sin superponer piezas, una sola vez y sin controles extra', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/info/about');
  const logo = page.locator('[data-logo-assembly]');
  await expect(logo).toHaveAttribute('data-logo-assembled', 'true');
  await expect(logo.getByRole('button')).toHaveCount(0);
  expect(
    await logo
      .locator('[data-logo-slot]')
      .evaluateAll((slots) =>
        slots.every((slot) => slot.hasAttribute('clip-path')),
      ),
  ).toBe(true);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await logo.scrollIntoViewIfNeeded();
  await expect(logo).not.toHaveAttribute('data-logo-playing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(logo).toHaveAttribute('data-logo-assembled', 'true');
  await expect
    .poll(() =>
      logo.evaluate((element) =>
        [...element.querySelectorAll('[data-logo-piece]')].reduce(
          (count, piece) => count + piece.getAnimations().length,
          0,
        ),
      ),
    )
    .toBe(0);
  await expect(logo.getByRole('img')).toBeVisible();
});
