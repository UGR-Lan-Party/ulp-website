import { test, expect } from '@playwright/test';

test.use({
  launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  reducedMotion: 'reduce',
});

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('El visor ampliado conserva el render y devuelve el foco al cerrar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/actividades/ajedrez/');
  const viewer = page.locator('.trophy-viewer');
  const expand = viewer.getByRole('button', { name: 'Ampliar trofeo' });
  await viewer.scrollIntoViewIfNeeded();
  await expect(expand).toBeVisible({ timeout: 30000 });
  const renderer = await viewer.locator('canvas').elementHandle();
  expect(renderer).not.toBeNull();
  const dialog = viewer.getByRole('dialog');
  const originalWidth = await renderer!.evaluate(
    (canvas) => canvas.clientWidth,
  );

  await expand.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName('Trofeo Ajedrez, vista ampliada');
  await expect
    .poll(() => renderer!.evaluate((canvas) => canvas.clientWidth))
    .toBeGreaterThan(originalWidth);
  expect(
    await renderer!.evaluate((canvas) =>
      Boolean(canvas.closest('dialog[open]')),
    ),
  ).toBe(true);
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(expand).toBeFocused();
  await expect
    .poll(() =>
      renderer!.evaluate((canvas) =>
        Boolean(canvas.closest('[data-trophy-inline]')),
      ),
    )
    .toBe(true);
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');

  await page.setViewportSize({ width: 390, height: 844 });
  await expand.click();
  await expect(dialog).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await dialog.getByRole('button', { name: 'Cerrar visor ampliado' }).click();
  await expect(expand).toBeFocused();
  await expect(viewer.locator('canvas')).toHaveCount(1);
  expect(await renderer!.evaluate((canvas) => canvas.isConnected)).toBe(true);
});

test('Twitch carga el vídeo al pulsar y ofrece el enlace directo en móvil', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/info/about/');
  const recording = page.locator('[data-twitch-recording]');
  const player = recording.locator('[data-twitch-player]');
  await expect(player.locator('iframe')).toHaveCount(0);
  const play = recording.locator('[data-twitch-play]');
  const target = new URL((await play.getAttribute('href'))!);
  await play.click();
  const iframe = player.locator('iframe');
  await expect(iframe).toBeVisible();
  const source = new URL((await iframe.getAttribute('src'))!);
  expect(source.hostname).toBe('player.twitch.tv');
  expect(source.searchParams.get('video')).toBe(
    `v${target.pathname.split('/').at(-1)}`,
  );
  expect(source.searchParams.get('parent')).toBe(new URL(page.url()).hostname);
  await expect(iframe).toHaveAttribute('allowfullscreen', '');

  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/info/about/');
  const popupPromise = page.waitForEvent('popup');
  await page.locator('[data-twitch-play]').click();
  const popup = await popupPromise;
  await popup.close();
  await expect(page.locator('[data-twitch-player] iframe')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
