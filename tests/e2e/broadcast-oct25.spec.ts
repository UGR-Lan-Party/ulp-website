import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('Programme presets reflect the running order, remove the live caption and round glass camera holes', async ({
  page,
  context,
}) => {
  await page.goto('/info/streamers/');
  const studio = page.locator('[data-broadcast-studio]');
  const preset = studio.getByLabel('Momento del programa', { exact: true });
  await preset.selectOption('irl');
  await expect(studio.locator('[data-studio-scene="webcam"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    studio.locator('[data-studio-view="horizontal"] [data-studio-chat-demo]'),
  ).toBeHidden();
  await expect(studio.locator('[data-studio-program-note]')).toContainText(
    'VDO.Ninja',
  );
  await preset.selectOption('mesa');
  await expect(
    studio.locator('[data-studio-view="horizontal"] [data-studio-chat-demo]'),
  ).toBeVisible();
  await preset.selectOption('lol');
  await expect(studio.getByLabel('Actividad', { exact: true })).toHaveValue(
    'league-of-legends',
  );
  await studio.locator('[data-studio-design="glass"]').click();
  await expect(
    studio.locator('[data-studio-view="horizontal"] [data-studio-preview]'),
  ).toHaveAttribute('data-design', 'glass');
  const promise = page.waitForEvent('download');
  await studio
    .getByRole('button', {
      name: 'Descargar escena animada horizontal',
      exact: true,
    })
    .click();
  const file = await promise;
  const player = await context.newPage();
  await player.emulateMedia({ reducedMotion: 'reduce' });
  await player.setContent(await readFile((await file.path())!, 'utf8'));
  await expect(player.locator('canvas')).toHaveAttribute('data-ready', 'true');
  const rendered = await player.evaluate(() => {
    const w = window as any,
      canvas = document.querySelector('canvas')!,
      ctx = canvas.getContext('2d')!;
    const labels: string[] = [];
    const fill = ctx.fillText;
    ctx.fillText = function (text: string, ...args: any[]) {
      labels.push(text);
      return fill.call(this, text, ...(args as [number, number]));
    };
    const settings = {
      activityId: 'league-of-legends',
      design: 'glass',
      title: 'CAPTION TO REMOVE',
    };
    w.drawStudio(ctx, settings, 'live');
    const r = w.cameraRect(settings),
      alpha = (x: number, y: number) => ctx.getImageData(x, y, 1, 1).data[3];
    return {
      labels,
      corner: alpha(r.x + 2, r.y + 2),
      center: alpha(r.x + r.w / 2, r.y + r.h / 2),
    };
  });
  expect(rendered.labels).not.toContain('CAPTION TO REMOVE');
  expect(rendered.corner).toBe(255);
  expect(rendered.center).toBe(0);
  await player.close();
});

for (const width of [390, 1920])
  test(`OBS map fills the viewport and restores selected routes at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 1080 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/info/mapa/');
    await page.locator('[data-route-panel] summary').click();
    await page.locator('[data-route-destination]').selectOption('aulario-1.2');
    await page
      .locator('[data-route-form]')
      .evaluate((el: HTMLFormElement) => el.requestSubmit());
    await page.locator('[data-route-next]').click();
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-route-step',
      '1',
    );
    const href = await page
      .locator('[data-map-fullscreen]')
      .getAttribute('href');
    expect(href).toContain('desde=hall');
    expect(href).toContain('tramo=1');
    const clean = new URL(href!);
    clean.searchParams.delete('controles');
    const player = await context.newPage();
    await player.setViewportSize({ width, height: 1080 });
    player.on('pageerror', (e) => errors.push(e.message));
    await player.goto(clean.href);
    await expect(player.locator('[data-venue-map]')).toHaveAttribute(
      'data-route-step',
      '1',
    );
    await expect(player.locator('[data-obs-tools]')).toBeHidden();
    await expect(player.locator('nav,footer')).toHaveCount(0);
    const box = await player.locator('[data-venue-drawing]').boundingBox();
    expect(box!.width).toBe(width);
    expect(box!.height).toBe(1080);
    expect(
      await player.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await player.goto('/info/mapa/obs/?plano=principal-0&controles=1');
    await expect(player.locator('[data-venue-map]')).toHaveAttribute(
      'data-venue-plan',
      'principal-0',
    );
    await player
      .getByRole('button', { name: 'Mostrar controles', exact: true })
      .click();
    await expect(player.locator('[data-venue-building-select]')).toBeVisible();
    await player
      .getByRole('button', { name: 'Ocultar controles', exact: true })
      .click();
    await expect(player.locator('[data-venue-building-select]')).toBeHidden();
    expect(errors).toEqual([]);
    await player.close();
  });
