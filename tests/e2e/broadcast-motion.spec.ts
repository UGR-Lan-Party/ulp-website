import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const output of ['horizontal', 'vertical'])
  test(`Countdown preview pauses and resumes by elapsed time, and exported HTML works offline: ${output}`, async ({
    page,
    context,
  }) => {
    await page.clock.install();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info/streamers/#concierto');
    const studio = page.locator('[data-broadcast-studio]');
    await studio
      .getByRole('button', { name: 'Cuenta atrás', exact: true })
      .click();
    await studio.getByLabel('Duración en minutos', { exact: true }).fill('1');
    await studio
      .getByLabel('Título de cuenta atrás', { exact: true })
      .fill('</script><script>window.attacked=true</script>');
    const readout = studio.locator('[data-countdown-readout]');
    await expect(readout).toHaveText('01:00');
    await expect(
      studio.getByRole('button', { name: 'Pausar', exact: true }),
    ).toBeVisible();
    await page.clock.fastForward(31000);
    await expect(readout).toHaveText(/00:2[89]|00:30/);
    await studio.getByRole('button', { name: 'Pausar', exact: true }).click();
    const paused = await readout.textContent();
    await page.clock.fastForward(5000);
    await expect(readout).toHaveText(paused!);
    await studio
      .getByRole('button', { name: 'Continuar', exact: true })
      .click();
    await page.clock.fastForward(60000);
    await expect(readout).toHaveText('00:00');
    await studio
      .getByRole('button', { name: 'Reiniciar', exact: true })
      .click();
    await expect(readout).toHaveText('01:00');
    const downloadPromise = page.waitForEvent('download');
    await studio
      .getByRole('button', {
        name: `Descargar escena animada ${output}`,
        exact: true,
      })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      `ulp-concierto-countdown-${output}.html`,
    );
    const html = await readFile((await download.path())!, 'utf8');
    expect(html).not.toContain('</script><script>window.attacked');
    expect(html).toContain('SIL Open Font License');
    const player = await context.newPage();
    await player.clock.install();
    await player.emulateMedia({ reducedMotion: 'reduce' });
    const requests: string[] = [],
      errors: string[] = [];
    player.on('request', (r) => {
      if (/^https?:/.test(r.url())) requests.push(r.url());
    });
    player.on('pageerror', (e) => errors.push(e.message));
    await player.route('**/*', (route) =>
      /^https?:/.test(route.request().url()) ? route.abort() : route.continue(),
    );
    await player.setContent(html);
    const clock = player.locator('canvas');
    await expect(clock).toHaveAttribute('aria-label', '01:00');
    await player.clock.fastForward(1100);
    await expect(clock).toHaveAttribute('aria-label', /00:5[89]/);
    await player.clock.fastForward(61000);
    await expect(clock).toHaveAttribute('aria-label', '00:00');
    expect(
      await player.evaluate(() => (window as any).attacked),
    ).toBeUndefined();
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
    await player.close();
  });

test('Motion changes the actual canvas and stops when paused; scene headings use italic type', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.fillText;
    (window as any).drawnFonts = [];
    CanvasRenderingContext2D.prototype.fillText = function (
      text: string,
      ...args: any[]
    ) {
      (window as any).drawnFonts.push({ text, font: this.font });
      return original.call(this, text, ...(args as [number, number]));
    };
  });
  await page.goto('/info/streamers/');
  const studio = page.locator('[data-broadcast-studio]'),
    canvas = studio.locator(
      '[data-studio-view="horizontal"] [data-studio-canvas]',
    );
  await studio.getByRole('button', { name: 'Inicio', exact: true }).click();
  const snapshot = () =>
    canvas.evaluate((el: HTMLCanvasElement) => {
      const pixels = el
        .getContext('2d')!
        .getImageData(0, 0, el.width, el.height).data;
      let hash = 2166136261;
      for (let i = 0; i < pixels.length; i += 53)
        hash = Math.imul(hash ^ pixels[i], 16777619);
      return hash >>> 0;
    });
  const initial = await snapshot();
  await expect.poll(snapshot).not.toBe(initial);
  await studio
    .getByRole('button', { name: 'Pausar animación', exact: true })
    .click();
  const stable = await snapshot();
  await page.waitForTimeout(200);
  expect(await snapshot()).toBe(stable);
  for (const [name, title] of [
    ['Inicio', 'Enseguida empezamos'],
    ['Pausa', 'Volvemos en un momento'],
    ['Cierre', 'Gracias por estar ahí'],
  ]) {
    await studio.getByRole('button', { name, exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          (title) =>
            (window as any).drawnFonts.some(
              (entry: { text: string; font: string }) =>
                entry.text.startsWith(title.split(' ')[0]) &&
                entry.font.includes('italic'),
            ),
          title,
        ),
      )
      .toBe(true);
  }
  await studio
    .getByRole('button', { name: 'Activar animación', exact: true })
    .click();
  const promise = page.waitForEvent('download');
  await studio
    .getByRole('button', {
      name: 'Descargar escena animada horizontal',
      exact: true,
    })
    .click();
  const download = await promise,
    html = await readFile((await download.path())!, 'utf8');
  const player = await context.newPage();
  await player.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  player.on('pageerror', (e) => errors.push(e.message));
  await player.setContent(html);
  const exported = player.locator('canvas');
  const image = () =>
    exported.evaluate((el: HTMLCanvasElement) => {
      const pixels = el
        .getContext('2d')!
        .getImageData(0, 0, el.width, el.height).data;
      let hash = 2166136261;
      for (let i = 0; i < pixels.length; i += 53)
        hash = Math.imul(hash ^ pixels[i], 16777619);
      return hash >>> 0;
    });
  await expect(exported).toHaveAttribute('data-ready', 'true');
  const frame = await image();
  await expect.poll(image).not.toBe(frame);
  expect(errors).toEqual([]);
  await player.emulateMedia({ reducedMotion: 'reduce' });
  await expect(exported).toHaveAttribute('data-motion', 'off');
  const still = await image();
  await player.waitForTimeout(250);
  expect(await image()).toBe(still);
  await player.close();
});

test('Animated HTML reveals graphic layers and keeps static renders complete with the new contour background', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/info/streamers/#rocket-league');
  const studio = page.locator('[data-broadcast-studio]');
  const promise = page.waitForEvent('download');
  await studio
    .getByRole('button', {
      name: 'Descargar escena animada horizontal',
      exact: true,
    })
    .click();
  const download = await promise;
  const html = await readFile((await download.path())!, 'utf8');
  const player = await context.newPage();
  await player.setContent(html);
  await expect(player.locator('canvas')).toHaveAttribute('data-ready', 'true');
  const states = await player.evaluate(() => {
    const canvas = document.querySelector('canvas')!,
      ctx = canvas.getContext('2d')!,
      labels: string[] = [];
    const original = ctx.fillText;
    ctx.fillText = function (text: string, ...args: any[]) {
      labels.push(text);
      return original.call(this, text, ...(args as [number, number]));
    };
    const draw = (window as any).drawStudio;
    const settings = {
      activityId: 'rocket-league',
      teamA: 'Alpha ULP',
      teamB: 'Beta ULP',
      webcamLabel: 'Caster ULP',
      title: 'Rótulo ULP',
    };
    draw(ctx, settings, 'live', null, { time: 0, age: 0 });
    const entering = [...labels];
    labels.length = 0;
    draw(ctx, settings, 'live', null, { time: 0, age: 1000 });
    const complete = [...labels];
    labels.length = 0;
    draw(ctx, settings, 'live', null, { time: 0 });
    const still = [...labels];
    return { entering, complete, still };
  });
  expect(states.entering).not.toContain('Alpha ULP');
  expect(states.complete).toContain('Alpha ULP');
  expect(states.still).toContain('Alpha ULP');
  expect(states.complete).toContain('Caster ULP');
  expect(states.still).not.toContain('Rótulo ULP');
  await player.close();
});
