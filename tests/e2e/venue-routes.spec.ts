import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
  await page.goto('/info/horarios/');
});
test('Routes use stairs and rounded curves; the step controls stay compact', async ({
  page,
}) => {
  await page.locator('[data-route-panel] summary').click();
  await expect(page.locator('[data-route-accessible]')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Ver recorrido', exact: false })
    .click();
  await expect(page.locator('[data-route-layer] path')).toHaveCount(2);
  await expect(page.locator('[data-route-layer] path').last()).toHaveAttribute(
    'd',
    /Q/,
  );
  await page.locator('[data-route-next]').click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'principal-baja',
  );
  await expect(page.locator('[data-route-instruction]')).toContainText(
    'escaleras',
  );
  await expect(page.locator('[data-route-note],.route-disclaimer')).toHaveCount(
    0,
  );
  expect(
    (await page.locator('[data-route-result]').boundingBox())!.height,
  ).toBeLessThan(150);
  await page.locator('[data-route-play]').click();
  await expect(page.locator('[data-route-play]')).toHaveText(
    'Pausar recorrido',
  );
  await page.locator('[data-route-play]').click();
  await page.locator('[data-route-close]').click();
  await expect(page.locator('[data-route-layer]')).toBeEmpty();
});
test('The hall-to-benches route stays in Vista General and keeps beige plans in dark mode', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-route-panel] summary').click();
  await page.locator('[data-route-destination]').selectOption('bancos-rojos');
  await page
    .locator('[data-route-form]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator('[data-route-steps] button')).toHaveCount(2);
  await page.locator('[data-route-steps] button').last().click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'recinto',
  );
  await expect(
    page.locator('[data-venue-floor-plan="pasillo-exterior"]'),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('.venue-canvas')).toHaveCSS(
    'background-color',
    'rgb(245, 240, 230)',
  );
  await expect(page.locator('.venue-drawing')).toHaveCSS(
    'color',
    'rgb(0, 71, 99)',
  );
  expect(
    await page
      .locator('[data-route-layer]')
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator('[data-route-panel]')
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  }
});
