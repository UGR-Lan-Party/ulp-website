import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const width of [320, 390, 1440])
  test(`El overlay personalizado se descarga como PNG transparente sin backend a ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const methods: string[] = [],
      urls: string[] = [],
      dialogs: string[] = [];
    page.on('request', (r) => {
      methods.push(r.method());
      urls.push(r.url());
    });
    page.on('dialog', async (d) => {
      dialogs.push(d.message());
      await d.dismiss();
    });
    await page.goto('/info/streamers/#lol');
    await page.locator('[data-stream-archive] > summary').click();
    const profile = page.locator('[data-stream-profile=lol]');
    await profile.getByRole('button', { name: 'Personalizar overlay' }).click();
    const form = profile.getByRole('form', {
      name: 'Personalizar overlay de League of Legends',
    });
    await form.getByLabel('Equipo A', { exact: true }).fill('Granada A');
    await form.getByLabel('Equipo B', { exact: true }).fill('ETSIIT B');
    await form.getByLabel('Marcador A', { exact: true }).fill('3');
    await form.getByLabel('Marcador B', { exact: true }).fill('1');
    await form
      .getByLabel('Texto del rótulo', { exact: true })
      .fill('Final de torneo');
    await form
      .getByLabel('Jugador o equipo', { exact: true })
      .fill('<svg/onload=alert(1)>');
    await expect(profile.locator('svg[onload]')).toHaveCount(0);
    await form
      .getByLabel('Jugador o equipo', { exact: true })
      .fill('UGR LAN Party');
    const canvas = profile.locator('canvas');
    await expect(canvas).toHaveAttribute(
      'aria-label',
      /Granada A 3, ETSIIT B 1/,
    );
    await expect(profile.locator('[data-kind=rotulo]')).toBeHidden();
    if (width === 1440) {
      await page.evaluate(() => {
        dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
        dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      });
      await expect(canvas).toHaveAttribute('width', '1920');
    }
    methods.length = 0;
    const promise = page.waitForEvent('download');
    await form
      .getByRole('button', { name: 'Descargar PNG personalizado' })
      .click();
    const download = await promise;
    expect(download.suggestedFilename()).toBe('ulp-overlay-lol-1920x1080.png');
    const bytes = await readFile((await download.path())!);
    const { data, info: png } = await sharp(bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([png.width, png.height]).toEqual([1920, 1080]);
    const alpha = (x: number, y: number) => data[(y * png.width + x) * 4 + 3];
    expect(alpha(960, 540)).toBe(0);
    expect(alpha(0, 0)).toBe(0);
    expect(alpha(880, 35)).toBe(255);
    expect(alpha(180, 900)).toBe(255);
    await expect(form.getByRole('status')).toHaveText(
      'PNG listo. Se ha iniciado la descarga.',
    );
    await profile
      .getByRole('button', {
        name: 'Ampliar vista previa de League of Legends',
      })
      .click();
    const dialog = page.getByRole('dialog', {
      name: 'League of Legends · Vista previa',
    });
    await expect(dialog.locator('canvas')).toHaveAttribute('width', '1920');
    expect(
      await dialog
        .locator('canvas')
        .evaluate(
          (el: HTMLCanvasElement) =>
            el.getContext('2d')!.getImageData(880, 35, 1, 1).data[3],
        ),
    ).toBe(255);
    await page.keyboard.press('Escape');
    await form.getByRole('radio', { name: 'Rótulo', exact: true }).check();
    await expect(form.getByLabel('Equipo A', { exact: true })).toBeHidden();
    await expect
      .poll(() =>
        canvas.evaluate(
          (el: HTMLCanvasElement) =>
            el.getContext('2d')!.getImageData(880, 35, 1, 1).data[3],
        ),
      )
      .toBe(0);
    await form.getByRole('button', { name: 'Restablecer' }).click();
    await expect(form.getByLabel('Equipo A', { exact: true })).toHaveValue(
      'Equipo A',
    );
    expect(methods.every((m) => m === 'GET')).toBe(true);
    expect(
      urls.some((u) => u.includes('Granada%20A') || u.includes('Granada+A')),
    ).toBe(false);
    expect(dialogs).toEqual([]);
    await profile.screenshot({
      path: info.outputPath(`custom-overlay-${width}.png`),
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test('Un fallo de marco permite exportar de nuevo sin la capa original', async ({
  page,
}) => {
  await page.route('**/originales/marco-general.png', (r) =>
    r.fulfill({ status: 503, body: '' }),
  );
  await page.goto('/info/streamers/');
  await page.locator('[data-stream-archive] > summary').click();
  const profile = page.locator('[data-stream-profile=general]');
  await profile.getByRole('button', { name: 'Personalizar overlay' }).click();
  const form = profile.getByRole('form');
  await form
    .getByRole('button', { name: 'Descargar PNG personalizado' })
    .click();
  await expect(form.getByRole('status')).toContainText('No se ha podido crear');
  await expect(
    form.getByRole('button', { name: 'Descargar PNG personalizado' }),
  ).toBeEnabled();
  await form.getByLabel('Incluir marco original').uncheck();
  const promise = page.waitForEvent('download');
  await form
    .getByRole('button', { name: 'Descargar PNG personalizado' })
    .click();
  await promise;
  await expect(form.getByRole('status')).toContainText('PNG listo');
});
