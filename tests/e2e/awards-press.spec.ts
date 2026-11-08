import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('la vitrina revela solo el premio elegido y cancela el movimiento al reducirlo', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/actividades/league-of-legends');
  const cards = page.locator('[data-award-reveal]');
  const first = cards.first();
  await first.locator('[data-award-show]').focus();
  await first.locator('[data-award-show]').press('Enter');
  await expect(first).toHaveAttribute('data-award-opened', 'true');
  await expect(first.locator('[data-award-list]')).not.toHaveAttribute(
    'aria-hidden',
  );
  await expect(cards.nth(1)).toHaveAttribute('data-concealed', 'true');
  const light = page.locator('[data-award-light]').first();
  await expect
    .poll(() => light.evaluate((element) => element.getAnimations().length))
    .toBe(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => light.evaluate((element) => element.getAnimations().length))
    .toBe(0);
  await cards.nth(1).locator('[data-award-show]').click();
  await expect(cards.nth(1)).toHaveAttribute('data-award-opened', 'true');
  expect(
    await page
      .locator('[data-award-light]')
      .nth(1)
      .evaluate((element) => element.getAnimations().length),
  ).toBe(0);
});

test('los botones de acción se hunden al pulsar sin mover el contenido', async ({
  page,
}) => {
  await page.goto('/');
  const button = page.locator('.hero-actions .design-button').first();
  await button.hover();
  const before = await button.evaluate(
    (element) => (element as HTMLElement).offsetTop,
  );
  await page.mouse.down();
  await expect
    .poll(() =>
      button.evaluate(
        (element) => new DOMMatrix(getComputedStyle(element).transform).m42,
      ),
    )
    .toBe(2);
  expect(
    await button.evaluate((element) => (element as HTMLElement).offsetTop),
  ).toBe(before);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(button).toHaveCSS('transform', 'none');
  await page.mouse.move(0, 0);
  await page.mouse.up();
});
