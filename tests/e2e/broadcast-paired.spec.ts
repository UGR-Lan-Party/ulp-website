import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
for (const width of [320, 390, 1440])
  test(`Both previews remain side by side, synchronized and independently expandable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/info/streamers/#minecraft');
    const s = page.locator('[data-broadcast-studio]');
    await expect(
      s.getByLabel('Formato de emisión', { exact: true }),
    ).toHaveCount(0);
    const h = s.locator('[data-studio-view="horizontal"]'),
      v = s.locator('[data-studio-view="vertical"]');
    await expect(h).toBeVisible();
    await expect(v).toBeVisible();
    const a = await h.boundingBox(),
      b = await v.boundingBox();
    expect(a!.x + a!.width).toBeLessThanOrEqual(b!.x);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(v.locator('[data-studio-image]')).toHaveAttribute(
      'src',
      (await h.locator('[data-studio-image]').getAttribute('src')) || '',
    );
    await s.getByRole('button', { name: 'Entrevista', exact: true }).click();
    await s
      .getByLabel('Texto de la segunda webcam', { exact: true })
      .fill('Invitada Granada');
    for (const view of [h, v]) {
      await expect(view.locator('[data-studio-canvas]')).toHaveAttribute(
        'aria-label',
        /Invitada Granada/,
      );
      await expect(
        view.locator('[data-studio-camera-demo-second]'),
      ).toBeVisible();
      await expect(view.locator('[data-studio-chat-demo]')).toBeVisible();
    }
    await s.getByRole('button', { name: 'Transparencia', exact: true }).click();
    for (const view of [h, v])
      await expect(view.locator('[data-studio-preview]')).toHaveAttribute(
        'data-transparent',
        'true',
      );
    await s
      .getByRole('button', { name: 'Ampliar diseño vertical', exact: true })
      .click();
    await expect(s.getByRole('dialog').locator('canvas')).toHaveAttribute(
      'height',
      '1920',
    );
    await page.keyboard.press('Escape');
    await s
      .getByRole('button', { name: 'Ampliar diseño horizontal', exact: true })
      .click();
    await expect(s.getByRole('dialog').locator('canvas')).toHaveAttribute(
      'width',
      '1920',
    );
    await page.keyboard.press('Escape');
  });
test('Exported scenes draw exactly one motif and preserve the upper-half game frame', async ({
  page,
  context,
}) => {
  await page.goto('/info/streamers/#minecraft');
  const s = page.locator('[data-broadcast-studio]');
  const pending = page.waitForEvent('download');
  await s
    .getByRole('button', {
      name: 'Descargar escena animada vertical',
      exact: true,
    })
    .click();
  const file = await pending;
  const p = await context.newPage();
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.setContent(await readFile((await file.path())!, 'utf8'));
  await expect(p.locator('canvas')).toHaveAttribute('data-ready', 'true');
  await expect(s.locator('[data-studio-design]')).toHaveCount(3);
  await expect(s.getByRole('button', { name: /Lino/ })).toHaveCount(0);
  const counts = await p.evaluate(() => {
    const w = window as any,
      ctx = document.querySelector('canvas')!.getContext('2d')!;
    const contours = w.drawContours,
      granada = w.drawGranadaMotif;
    let curves = 0,
      stars = 0;
    w.drawContours = (...a: any[]) => {
      curves++;
      contours(...a);
    };
    w.drawGranadaMotif = (...a: any[]) => {
      stars++;
      granada(...a);
    };
    const result: Record<string, number[]> = {};
    for (const scene of [
      'live',
      'inicio',
      'countdown',
      'pausa',
      'final',
      'interview',
    ]) {
      curves = stars = 0;
      w.drawStudio(ctx, { output: 'vertical' }, scene);
      result[scene] = [curves, stars];
    }
    return result;
  });
  for (const scene of ['inicio', 'countdown', 'final'])
    expect(counts[scene]).toEqual([0, 1]);
  for (const scene of ['live', 'pausa', 'interview'])
    expect(counts[scene]).toEqual([1, 0]);
  const changedPixels = await p.evaluate(() => {
    const w = window as any,
      canvas = document.querySelector('canvas')!,
      ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    w.drawContours(ctx, canvas.width, canvas.height, 0);
    const first = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    w.drawContours(ctx, canvas.width, canvas.height, 4000);
    const second = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let changed = 0;
    for (let i = 3; i < first.length; i += 4)
      if (first[i] !== second[i]) changed++;
    return changed;
  });
  expect(changedPixels).toBeGreaterThan(1000);
  await p.close();
});
