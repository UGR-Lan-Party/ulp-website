import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const width of [390, 1440])
  test(`Activity presets preserve capture aspect and native vertical game stays readable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/info/streamers/#league-of-legends');
    const studio = page.locator('[data-broadcast-studio]');
    await expect(studio.locator('[data-studio-profile-note]')).toContainText(
      'minimapa',
    );
    await studio.getByLabel('Actividad', { exact: true }).selectOption('f1');
    await expect(
      studio.getByLabel('Etiqueta de la marca', { exact: true }),
    ).toHaveValue('Mejor vuelta');
    await expect(
      studio.getByLabel('Ronda o fase', { exact: true }),
    ).toHaveValue('Contrarreloj');
    await studio.getByText('Marcador y capas', { exact: true }).click();
    await studio
      .getByLabel('Marca o tiempo', { exact: true })
      .fill('01:24.381');
    await studio
      .getByLabel('Actividad', { exact: true })
      .selectOption('clash-royale');
    await expect(studio.locator('[data-studio-field="webcam"]')).toBeChecked();
    await expect
      .poll(() =>
        studio
          .locator('[data-studio-view="vertical"] [data-studio-image]')
          .evaluate(
            (el: HTMLImageElement) =>
              ((parseFloat(el.style.width) / parseFloat(el.style.height)) *
                1080) /
              1920,
          ),
      )
      .toBeCloseTo(9 / 16, 3);
    const promise = page.waitForEvent('download');
    await studio
      .getByRole('button', { name: 'Descargar PNG vertical', exact: true })
      .click();
    const download = await promise;
    const { data, info } = await sharp(await readFile((await download.path())!))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([info.width, info.height]).toEqual([1080, 1920]);
    const alpha = (x: number, y: number) => data[(y * 1080 + x) * 4 + 3];
    expect(alpha(400, 500)).toBe(0);
    expect(alpha(400, 960)).toBe(255);
    await studio.getByRole('button', { name: 'Inicio', exact: true }).click();
    await expect(
      studio.locator('[data-studio-view="horizontal"] [data-studio-chat-demo]'),
    ).toBeVisible();
    const chatPromise = page.waitForEvent('download');
    await studio
      .getByRole('button', {
        name: 'Descargar escena animada horizontal',
        exact: true,
      })
      .click();
    const chatDownload = await chatPromise;
    const html = await readFile((await chatDownload.path())!, 'utf8');
    expect(html).not.toContain('¡Nos vemos en la LAN!');
    expect(html).not.toContain('Player 02');
    expect(html).toContain('CHAT EN DIRECTO');
    await studio
      .getByLabel('Actividad', { exact: true })
      .selectOption('minecraft');
    await expect(studio.locator('[data-studio-field="webcam"]')).toBeChecked();
    await studio
      .getByRole('button', { name: 'Entrevista', exact: true })
      .click();
    await expect(
      studio.locator(
        '[data-studio-view="horizontal"] [data-studio-camera-demo-second]',
      ),
    ).toBeVisible();
    await expect(
      studio.locator('[data-studio-view="horizontal"] [data-studio-chat-demo]'),
    ).toBeVisible();
    await studio.getByText('Reservar zona de chat', { exact: true }).click();
    await expect(
      studio.locator('[data-studio-view="horizontal"] [data-studio-chat-demo]'),
    ).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
