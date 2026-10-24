import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('El logo de cada entidad tiene profundidad sutil y se detiene con movimiento reducido', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/participan/');
  const card = page.locator('[data-partner-card]').first();
  await card.scrollIntoViewIfNeeded();
  const logo = card.locator('.partner-logo-frame');
  const initial = await logo.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  const bounds = (await card.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.85,
    bounds.y + bounds.height * 0.15,
  );
  await expect
    .poll(() => logo.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initial);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(logo).toHaveCSS('transform', 'none');
});

test('El catálogo intercambia los avisos de equipo y muestra el nombre e imagen solicitados', async ({
  page,
}) => {
  await page.goto('/actividades/');
  const positions = await page.evaluate(() => ({
    top: document.querySelector('.team-callout')!.getBoundingClientRect().top,
    competitions: document
      .querySelector('#competiciones')!
      .getBoundingClientRect().top,
    bottom: document.querySelector('.team-intro')!.getBoundingClientRect().top,
    activities: document.querySelector('#actividades')!.getBoundingClientRect()
      .bottom,
  }));
  expect(positions.top).toBeLessThan(positions.competitions);
  expect(positions.bottom).toBeGreaterThanOrEqual(positions.activities);
  await expect(
    page.locator('a.activity-tile[href="/actividades/cars"] h3'),
  ).toHaveText('Cars: Copa Pistón');
  await expect(
    page.locator(
      'a.activity-tile[href="/actividades/street-fighter"] .activity-tile-background',
    ),
  ).toHaveAttribute('src', /32e99af1d2ff/);
});

test('La lectura del blog usa Inter y una columna editorial sin desbordarse en móvil', async ({
  page,
}) => {
  await page.goto('/blog/havefungamers/');
  const body = page.locator('.article-body');
  for (const paragraph of await body.locator(':scope > p').all()) {
    await expect(paragraph).toHaveCSS('text-align', 'start');
    await expect(paragraph).toHaveCSS('font-family', /Inter/);
  }
  const quote = body.locator('blockquote p');
  await expect(quote).toHaveCSS('color', 'rgb(0, 68, 101)');
  await expect(quote).toHaveCSS('text-align', 'start');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
