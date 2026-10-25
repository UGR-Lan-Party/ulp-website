import { test, expect } from '@playwright/test';
test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const width of [320, 390])
  test(`Foco y controles principales no se pisan y son táctiles a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info/streamers/');
    const controls = page.locator('.header-actions button:visible');
    for (const control of await controls.all()) {
      const b = (await control.boundingBox())!;
      expect(b.width).toBeGreaterThanOrEqual(44);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#contenido-principal')).toBeFocused();
    const link = page.getByRole('link', {
      name: 'Recursos de comunicación',
      exact: false,
    });
    await link.focus();
    const focus = await link.evaluate((el) => ({
      style: getComputedStyle(el).outlineStyle,
      width: parseFloat(getComputedStyle(el).outlineWidth),
    }));
    expect(focus.style).not.toBe('none');
    expect(focus.width).toBeGreaterThanOrEqual(2);
    const header = (await page.locator('.ud-header').boundingBox())!,
      target = (await link.boundingBox())!;
    expect(target.y).toBeGreaterThanOrEqual(header.y + header.height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test('Los trofeos se cargan al abrir la página y admiten giro con teclado', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const modelRequests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/assets/models/')) modelRequests.push(r.url());
  });
  await page.goto('/actividades/league-of-legends/');
  const viewer = page.locator('[data-trophy]');
  const initial = (await viewer.boundingBox())!;
  expect(initial.y).toBeGreaterThan(800);

  await expect(viewer.locator('[data-trophy-status]')).toContainText(
    'Arrastra',
  );
  expect(modelRequests.length).toBeGreaterThan(0);
  await expect(viewer.locator('canvas')).toHaveCount(1);
  await viewer.scrollIntoViewIfNeeded();
  const canvas = viewer.locator('canvas');
  await canvas.focus();
  const before = await canvas.screenshot();
  await canvas.press('ArrowRight');
  await expect
    .poll(async () => Buffer.compare(before, await canvas.screenshot()))
    .not.toBe(0);
  expect(modelRequests.length).toBeGreaterThan(0);
});
test('Los originales de la galería se reservan para el visor ampliado', async ({
  page,
}) => {
  await page.goto('/info/ediciones_anteriores/');
  const gallery = page.locator('[data-photo-carousel]').first();
  const originals = await gallery.evaluate(
    (el) => JSON.parse((el as HTMLElement).dataset.photos!) as string[],
  );
  const previews = await gallery.evaluate(
    (el) => JSON.parse((el as HTMLElement).dataset.previews!) as string[],
  );
  const onlyOriginal = originals.filter((s) => !previews.includes(s));
  const requested: string[] = [];
  page.on('request', (r) => {
    if (onlyOriginal.includes(r.url())) requested.push(r.url());
  });
  await gallery.scrollIntoViewIfNeeded();
  expect(requested).toEqual([]);
  await expect(gallery.locator('[data-carousel-image]')).toHaveAttribute(
    'loading',
    'lazy',
  );
});
