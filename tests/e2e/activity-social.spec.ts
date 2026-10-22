import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import jsQR from 'jsqr';
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (r) =>
    r.fulfill({
      status: 200,
      body: '',
      contentType:
        r.request().resourceType() === 'script'
          ? 'application/javascript'
          : 'text/html',
    }),
  );
});
test('Cada actividad ofrece metadatos e imagen social PNG con horario de su edición', async ({
  page,
  request,
}) => {
  await page.goto('/actividades/league-of-legends/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://ulp.ugr.es/og/actividades/league-of-legends.png',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /ULP 2026.*desde las/,
  );
  const response = await request.get('/og/actividades/league-of-legends.png');
  expect(response.status()).toBe(200);
  const metadata = await sharp(await response.body()).metadata();
  expect(metadata.width).toBe(1200);
  expect(metadata.height).toBe(630);
});
test('Las fichas sociales permiten elegir y descargar tres composiciones sin desbordar en móvil', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/actividades/league-of-legends/');
  const panel = page.locator('[data-activity-share]');
  await panel.locator('summary').click();
  for (const [label, width, height, suffix] of [
    ['Post de X', 1200, 630, 'league-of-legends.png'],
    ['Historia de Instagram', 1080, 1920, 'league-of-legends/historia.png'],
    [
      'Publicación de Instagram',
      1080,
      1350,
      'league-of-legends/publicacion.png',
    ],
  ] as const) {
    const button = panel.getByRole('button', { name: new RegExp(label) });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    const preview = panel.locator('[data-share-preview]');
    await expect(preview).toHaveAttribute('src', `/og/actividades/${suffix}`);
    await expect(preview).toHaveAttribute('width', String(width));
    await expect(preview).toHaveAttribute('height', String(height));
    await expect(panel.locator('[data-share-download]')).toHaveAttribute(
      'href',
      `/og/actividades/${suffix}`,
    );
    const response = await request.get(`/og/actividades/${suffix}`);
    expect(response.ok()).toBeTruthy();
    const metadata = await sharp(await response.body()).metadata();
    expect([metadata.width, metadata.height]).toEqual([width, height]);
    const pixels = await sharp(await response.body())
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const decoded = jsQR(
      new Uint8ClampedArray(pixels.data),
      pixels.info.width,
      pixels.info.height,
    );
    expect(decoded?.data).toBe(
      'https://ulp.ugr.es/actividades/league-of-legends/',
    );
  }
  const downloadEvent = page.waitForEvent('download');
  await panel.locator('[data-share-download]').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe(
    'ulp-league-of-legends-publicacion.png',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
