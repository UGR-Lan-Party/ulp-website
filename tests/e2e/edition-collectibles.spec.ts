import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});

for (const width of [320, 390, 1440])
  test(`Las colecciones son completas y girables, con camisetas grandes sin marcos a ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/info/ediciones_anteriores/#camisetas');
    const shirts = page.locator('.edition-shirts'),
      posters = page.locator('.edition-posters');
    await shirts.scrollIntoViewIfNeeded();
    await expect(
      shirts.locator('.shirt-card:not([data-rail-copy]) h3'),
    ).toHaveText(['2026', '2025', '2024', '2023']);
    const first = shirts.locator('.shirt-card').first();
    await expect(first.locator('[data-collectible]')).toHaveAttribute(
      'data-ready',
      '',
      { timeout: 30000 },
    );
    expect((await shirts.boundingBox())!.height).toBeLessThan(620);
    expect(
      (await first.locator('[data-model-stage]').boundingBox())!.height,
    ).toBeGreaterThan(280);
    await expect(first).toHaveCSS('border-top-width', '0px');
    await expect(first).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(shirts.locator('.shirt-viewport')).toHaveCSS(
      'background-image',
      'none',
    );
    const heading = page.locator('#timeline-title');
    expect(
      await heading.evaluate(
        (el) =>
          el.getBoundingClientRect().height /
          parseFloat(getComputedStyle(el).lineHeight),
      ),
    ).toBeLessThan(1.1);
    expect(
      await posters.evaluate(
        (el) =>
          !!(
            document
              .querySelector('#encuestas-iniciales')!
              .compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
      ),
    ).toBe(true);
    const canvas = first.locator('canvas'),
      before = await canvas.screenshot();
    await canvas.focus();
    await canvas.press('ArrowRight');
    await expect
      .poll(async () => Buffer.compare(before, await canvas.screenshot()))
      .not.toBe(0);
    await expect(first.locator('[data-model-view]')).toHaveCount(0);
    await expect(first.locator('[data-model-expand]')).toHaveCount(0);
    const bounds = (await canvas.boundingBox())!;
    await page.mouse.move(
      bounds.x + bounds.width * 0.3,
      bounds.y + bounds.height * 0.5,
    );
    await page.mouse.down();
    await page.mouse.move(
      bounds.x + bounds.width * 0.7,
      bounds.y + bounds.height * 0.5,
      { steps: 6 },
    );
    await page.mouse.up();
    await expect(
      page.getByRole('dialog', { name: 'Camiseta ULP 2026, vista ampliada' }),
    ).not.toBeVisible();
    await canvas.click();
    const dialog = page.getByRole('dialog', {
      name: 'Camiseta ULP 2026, vista ampliada',
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('canvas')).toHaveCount(1);
    await dialog.screenshot({
      path: info.outputPath(`shirt-expanded-${width}.png`),
    });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(first.locator('canvas')).toHaveCount(1);
    await canvas.focus();
    await canvas.press('Enter');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await posters.scrollIntoViewIfNeeded();
    expect((await posters.boundingBox())!.height).toBeLessThan(350);
    await expect(posters.locator('[data-poster-open]')).toHaveCount(4);
    const poster = posters.locator('[data-poster-open]').first();
    await poster.click();
    const posterDialog = page.getByRole('dialog', {
      name: 'Cartel de ULP, vista ampliada',
    });
    await expect(posterDialog).toBeVisible();
    await expect
      .poll(() =>
        posterDialog
          .locator('[data-poster-image]')
          .evaluate((el: HTMLImageElement) => el.naturalHeight),
      )
      .toBeGreaterThan(2000);
    await page.keyboard.press('ArrowRight');
    await expect(posterDialog.locator('[data-poster-title]')).toHaveText(
      'Cartel ULP 2025',
    );
    await page.keyboard.press('Escape');
    await expect(posterDialog).not.toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });

test('El carrusel avanza, acepta rueda sin mover la página y respeta pausa y movimiento reducido', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('/info/ediciones_anteriores/#camisetas');
  const rail = page.locator('.edition-shirts [data-rail-viewport]');
  await rail.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const start = await rail.evaluate((el) => el.scrollLeft);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(start + 15);
  await rail.hover();
  const y = await page.evaluate(() => scrollY),
    left = await rail.evaluate((el) => el.scrollLeft);
  await page.mouse.wheel(0, 230);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(left + 180);
  expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(2);
  await page
    .getByRole('button', { name: 'Pausar carrusel de camisetas' })
    .click();
  await page.mouse.move(0, 0);
  const paused = await rail.evaluate((el) => el.scrollLeft);
  await page.evaluate(
    () =>
      new Promise((r) => {
        let n = 0;
        function next() {
          if (++n === 15) r(null);
          else requestAnimationFrame(next);
        }
        requestAnimationFrame(next);
      }),
  );
  expect(await rail.evaluate((el) => el.scrollLeft)).toBe(paused);
  await page
    .getByRole('button', { name: 'Activar carrusel de camisetas' })
    .click();
  await page.mouse.move(0, 0);
  await expect
    .poll(() => rail.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(paused + 10);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await rail.evaluate((el) => el.scrollLeft);
  await page.evaluate(
    () =>
      new Promise((r) => {
        let n = 0;
        function next() {
          if (++n === 15) r(null);
          else requestAnimationFrame(next);
        }
        requestAnimationFrame(next);
      }),
  );
  expect(await rail.evaluate((el) => el.scrollLeft)).toBe(reduced);
});

for (const width of [390, 1440])
  test(`La skin oficial se renderiza, gira y conserva el PNG descargable a ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/actividades/minecraft/');
    const skin = page.locator('[data-minecraft-skin]');
    await expect(skin.locator('[data-model-view]')).toHaveCount(0);
    await skin.scrollIntoViewIfNeeded();
    await expect(skin.locator('[data-collectible]')).toHaveAttribute(
      'data-ready',
      '',
      { timeout: 30000 },
    );
    const canvas = skin.locator('canvas');
    const before = await canvas.screenshot();
    await canvas.focus();
    await canvas.press('ArrowLeft');
    await expect
      .poll(async () => Buffer.compare(before, await canvas.screenshot()))
      .not.toBe(0);
    for (let i = 0; i < 8; i++) await canvas.press('ArrowDown');
    const atLowerLimit = await canvas.screenshot();
    for (let i = 0; i < 5; i++) await canvas.press('ArrowDown');
    expect(Buffer.compare(atLowerLimit, await canvas.screenshot())).toBe(0);
    await canvas.press('Home');
    await canvas.hover();
    const scrollBefore = await page.evaluate(() => scrollY);
    const normalZoom = await canvas.screenshot();
    await page.mouse.wheel(0, -350);
    await expect
      .poll(async () => Buffer.compare(normalZoom, await canvas.screenshot()))
      .not.toBe(0);
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - scrollBefore),
    ).toBeLessThan(2);
    await skin.screenshot({ path: info.outputPath(`skin-${width}.png`) });
    const downloadPromise = page.waitForEvent('download');
    await skin.getByRole('link', { name: 'Descargar skin' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('ULP-skin-minecraft.png');
    const actual = await readFile((await download.path())!),
      original = await readFile(
        'public/assets/activities/minecraft/ulp-skin.png',
      );
    const hash = (b: Buffer) => createHash('sha256').update(b).digest('hex');
    expect(hash(actual)).toBe(hash(original));
    expect(actual.readUInt32BE(16)).toBe(64);
    expect(actual.readUInt32BE(20)).toBe(64);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test('Un estampado que falla mantiene el diseño original visible y permite reintentar el 3D', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/2026-front.webp', (r) =>
    r.fulfill({ status: 503, body: '' }),
  );
  await page.goto('/info/ediciones_anteriores/#camisetas');
  const card = page.locator('.shirt-card').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('[data-model-retry]')).toBeVisible();
  await expect(card.locator('.model-fallback')).toBeVisible();
  await page.unroute('**/2026-front.webp');
  await card.locator('[data-model-retry]').click();
  await expect(card.locator('[data-collectible]')).toHaveAttribute(
    'data-ready',
    '',
    { timeout: 30000 },
  );
  await expect(card.locator('canvas')).toHaveCount(1);
});

test.describe('Camisetas táctiles', () => {
  test.use({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  test('Un toque abre el visor y tocar de nuevo la camiseta ampliada no lo cierra', async ({
    page,
  }) => {
    await page.goto('/info/ediciones_anteriores/#camisetas');
    const card = page.locator('.shirt-card').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('[data-collectible]')).toHaveAttribute(
      'data-ready',
      '',
      { timeout: 30000 },
    );
    await card.locator('canvas').tap();
    const dialog = page.getByRole('dialog', {
      name: 'Camiseta ULP 2026, vista ampliada',
    });
    await expect(dialog).toBeVisible();
    await dialog.locator('canvas').tap();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cerrar visor 3D' }).tap();
    await expect(dialog).not.toBeVisible();
  });
});
