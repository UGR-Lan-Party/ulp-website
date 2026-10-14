import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('La franja incluye las entidades y admite rueda, clic central y teclado sin mover la página', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const strip = page.locator('[data-partner-strip]');
  const viewport = strip.locator('[data-partner-viewport]');
  await expect(strip.getByRole('button')).toHaveCount(0);
  await expect(
    strip.locator('[data-partner-list]').first().locator('[data-partner-tier]'),
  ).toHaveText([
    'Diamante',
    'Platino',
    'Oro',
    'Plata',
    'Bronce',
    'Colaboradores',
  ]);
  const links = strip.locator('[data-partner-list]').first().getByRole('link');
  expect(await links.count()).toBeGreaterThan(30);
  await expect(
    strip.getByRole('link', { name: 'Patrocinador Secreto' }),
  ).toHaveCount(0);
  await expect(
    strip.getByRole('link', { name: 'CSIRC', exact: true }),
  ).toHaveCount(1);
  await strip.scrollIntoViewIfNeeded();
  const bounds = (await strip.boundingBox())!;
  expect(bounds.height).toBeLessThan(125);
  const pageY = await page.evaluate(() => scrollY);
  await viewport.hover();
  const initial = await viewport.evaluate((element) => element.scrollLeft);
  await page.mouse.wheel(0, 400);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(initial + 250);
  expect(await page.evaluate(() => scrollY)).toBe(pageY);
  const position = await viewport.evaluate((element) => element.scrollLeft);
  await viewport.click({ button: 'middle', position: { x: 25, y: 25 } });
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(position);
  await viewport.focus();
  const middle = await viewport.evaluate((element) => element.scrollLeft);
  await viewport.press('ArrowRight');
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(middle);
  await viewport.press('ArrowLeft');
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBe(middle);
});

test('La franja respeta el movimiento reducido y admite navegación táctil en móvil', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const viewport = page.locator('[data-partner-viewport]');
  await viewport.scrollIntoViewIfNeeded();
  const first = await viewport.evaluate((element) => element.scrollLeft);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(first);
  await viewport.evaluate((element) => element.scrollBy({ left: 200 }));
  expect(
    await viewport.evaluate((element) => element.scrollLeft),
  ).toBeGreaterThan(first);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('La franja avanza automáticamente y se pausa al pasar el cursor', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const viewport = page.locator('[data-partner-viewport]');
  await viewport.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const initial = await viewport.evaluate((element) => element.scrollLeft);
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(initial + 3);
  await viewport.hover();
  const paused = await viewport.evaluate((element) => element.scrollLeft);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 0;
        const next = () => {
          if (++frames === 12) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }),
  );
  expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(paused);
});

test('Los seis logos claros cambian de contraste al cambiar el tema', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const list = page.locator('[data-partner-list]').first();
  const names = [
    'Nacon España',
    'DEIIT',
    'Mars Gaming',
    'The Game Kitchen',
    'Iction Games',
    'Hackiit',
  ];
  for (const name of names) {
    const image = list.locator(`[data-partner-logo="${name}"]`);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveCSS('filter', 'brightness(0)');
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  for (const name of names) {
    await expect(list.locator(`[data-partner-logo="${name}"]`)).toHaveCSS(
      'filter',
      'brightness(0) invert(1)',
    );
  }
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  for (const name of names) {
    await expect(list.locator(`[data-partner-logo="${name}"]`)).toHaveCSS(
      'filter',
      'brightness(0)',
    );
  }
});
