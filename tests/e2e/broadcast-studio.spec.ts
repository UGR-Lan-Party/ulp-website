import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import program from '../../src/data/program-2026.json' with { type: 'json' };
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const width of [320, 390, 1440])
  test(`El estudio incluye el catálogo completo y exporta un overlay con webcam a ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/info/streamers/#2XKO');
    const studio = page.locator('[data-broadcast-studio]'),
      form = studio.getByRole('form');
    const select = studio.getByLabel('Actividad', { exact: true });
    await expect(select).toHaveValue('2XKO');
    const ids = await select
      .locator('option')
      .evaluateAll((options) =>
        options.map((o) => (o as HTMLOptionElement).value),
      );
    for (const game of program.games) expect(ids).toContain(game.id);
    for (const talk of program.talks.filter((t) => t.id !== 'charla-6'))
      expect(ids).toContain(talk.id);
    expect(ids).toContain('concierto');
    expect(new Set(ids).size).toBe(ids.length);
    await expect(page.locator('[data-stream-archive]')).not.toHaveAttribute(
      'open',
    );
    await expect(studio).toHaveAttribute('data-motion', 'off');
    await form
      .getByLabel('Texto de la webcam', { exact: true })
      .fill('<svg onload=alert(1)>');
    await expect(studio.locator('svg[onload]')).toHaveCount(0);
    await form
      .getByLabel('Texto de la webcam', { exact: true })
      .fill('Caster de Granada');
    await form.getByLabel('Formato', { exact: true }).selectOption('4:3');
    await form.getByLabel('Posición', { exact: true }).selectOption('left');
    await form
      .getByLabel('Título del rótulo', { exact: true })
      .fill('La gran final');
    await studio.getByRole('button', { name: /Cristal/ }).click();
    await expect(
      studio.locator('[data-studio-view="horizontal"] [data-studio-canvas]'),
    ).toHaveAttribute('aria-label', /Caster de Granada/);
    const methods: string[] = [];
    page.on('request', (r) => methods.push(r.method()));
    const promise = page.waitForEvent('download');
    await studio
      .getByRole('button', { name: 'Descargar PNG horizontal', exact: true })
      .click();
    const download = await promise;
    expect(download.suggestedFilename()).toBe('ulp-2XKO-live-1920x1080.png');
    const bytes = await readFile((await download.path())!);
    const { data, info: png } = await sharp(bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([png.width, png.height]).toEqual([1920, 1080]);
    const alpha = (x: number, y: number) => data[(y * 1920 + x) * 4 + 3];
    expect(alpha(960, 540)).toBe(0);
    expect(alpha(200, 250)).toBe(0);
    expect(alpha(32, 200)).toBeGreaterThan(150);
    expect(alpha(100, 700)).toBeGreaterThan(200);
    expect(methods.every((m) => m === 'GET')).toBe(true);
    await studio
      .getByRole('button', { name: 'Ampliar diseño horizontal', exact: true })
      .click();
    await expect(studio.getByRole('dialog')).toBeVisible();
    await expect(studio.getByRole('dialog').locator('canvas')).toHaveAttribute(
      'width',
      '1920',
    );
    await page.keyboard.press('Escape');
    await expect(
      studio.getByRole('button', {
        name: 'Ampliar diseño horizontal',
        exact: true,
      }),
    ).toBeFocused();
    await studio.getByRole('button', { name: 'Rótulo', exact: true }).click();
    await expect(studio.locator('[data-studio-preview-label]')).toContainText(
      'Rótulo',
    );
    await expect
      .poll(() =>
        studio
          .locator('[data-studio-view="horizontal"] [data-studio-canvas]')
          .evaluate(
            (el: HTMLCanvasElement) =>
              el.getContext('2d')!.getImageData(960, 85, 1, 1).data[3],
          ),
      )
      .toBe(0);
    await form.getByRole('button', { name: /Restablecer/ }).click();
    await expect(
      form.getByLabel('Texto de la webcam', { exact: true }),
    ).toHaveValue('Tu nombre / caster');
    await expect(select).toHaveValue('general');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    await studio.screenshot({ path: info.outputPath(`studio-${width}.png`) });
  });
function unpack(bytes: Buffer) {
  const files = new Map<string, Buffer>();
  let offset = 0;
  while (bytes.readUInt32LE(offset) === 0x04034b50) {
    const size = bytes.readUInt32LE(offset + 18),
      len = bytes.readUInt16LE(offset + 26),
      extra = bytes.readUInt16LE(offset + 28),
      name = bytes.subarray(offset + 30, offset + 30 + len).toString(),
      start = offset + 30 + len + extra;
    files.set(name, bytes.subarray(start, start + size));
    offset = start + size;
  }
  return files;
}
test('El pack nuevo prepara la cámara cuadrada en su posición y conserva las fuentes y escenas', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() =>
    Object.defineProperty(crypto, 'randomUUID', {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto('/info/streamers/#concierto');
  const studio = page.locator('[data-broadcast-studio]'),
    form = studio.getByRole('form');
  await form.getByLabel('Formato', { exact: true }).selectOption('1:1');
  await form.getByLabel('Posición', { exact: true }).selectOption('left');
  await form
    .getByLabel('Nombre del canal', { exact: true })
    .fill('Canal Granada');
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.method()));
  const promise = page.waitForEvent('download');
  await form.getByRole('button', { name: 'Pack OBS', exact: false }).click();
  const download = await promise;
  expect(download.suggestedFilename()).toBe(
    'ulp-studio-obs-concierto-multistream.zip',
  );
  const files = unpack(await readFile((await download.path())!));
  expect(files.size).toBe(38);
  const data = JSON.parse(
    files.get('horizontal/coleccion-ulp.json')!.toString(),
  );
  expect(data.name).toBe('ULP Studio · Concierto · Horizontal');
  expect(data.scene_order.map((s: { name: string }) => s.name)).toEqual([
    'Inicio',
    'Cuenta atrás',
    'Partida',
    'Webcam',
    'Doble webcam',
    'Entrevista',
    'Pausa',
    'Final',
    'Tu juego',
    'Tu webcam',
    'Tu webcam 2',
    'Tu chat',
  ]);
  const camera = data.sources.find(
    (s: { name: string }) => s.name === 'Tu webcam',
  );
  expect(camera.settings).toMatchObject({
    custom_size: true,
    cx: 336,
    cy: 336,
    items: [],
  });
  const live = data.sources.find((s: { name: string }) => s.name === 'Partida');
  const camItem = live.settings.items.find(
    (s: { name: string }) => s.name === 'Tu webcam',
  );
  expect(camItem.pos).toEqual({ x: 32, y: 132 });
  expect(camItem.bounds).toEqual({ x: 336, y: 336 });
  expect(live.settings.items.at(-1).name).toBe('ULP · Overlay personalizado');
  for (const scene of data.sources.filter(
    (s: { id: string }) => s.id === 'scene',
  )) {
    expect(
      new Set(scene.settings.items.map((i: { id: number }) => i.id)).size,
    ).toBe(scene.settings.items.length);
    for (const item of scene.settings.items)
      expect(
        data.sources.some((s: { uuid: string }) => s.uuid === item.source_uuid),
      ).toBe(true);
  }
  for (const source of data.sources.filter(
    (s: { id: string }) => s.id === 'image_source',
  ))
    expect(files.has('horizontal/' + source.settings.file.slice(2))).toBe(true);
  for (const filename of [
    'overlay',
    'webcam',
    'doble-webcam',
    'entrevista',
    'cuenta-atras',
    'inicio',
    'pausa',
    'final',
    'fondo',
  ]) {
    const meta = await sharp(
      files.get(`horizontal/recursos/${filename}.png`),
    ).metadata();
    expect([meta.width, meta.height]).toEqual([1920, 1080]);
  }
  expect(requests.every((m) => m === 'GET')).toBe(true);
  await expect(form.getByRole('status')).toContainText('Pack OBS listo');
});
test('Actividad propia, cierre editable y recarga del enlace conservan una selección válida', async ({
  page,
}) => {
  await page.goto('/info/streamers/#watch-party');
  const studio = page.locator('[data-broadcast-studio]');
  await expect(studio.getByLabel('Actividad', { exact: true })).toHaveValue(
    'watch-party',
  );
  await page.reload();
  await expect(studio.getByLabel('Actividad', { exact: true })).toHaveValue(
    'watch-party',
  );
  await studio
    .getByLabel('Actividad', { exact: true })
    .selectOption('personalizada');
  await studio
    .getByLabel('Nombre de la actividad', { exact: true })
    .fill('Mi programa especial');
  await studio.getByRole('button', { name: 'Cierre', exact: true }).click();
  await expect(
    studio.locator('[data-studio-view="horizontal"] [data-studio-canvas]'),
  ).toHaveAttribute('aria-label', /Mi programa especial/);
  await studio.getByText('Marcador y capas', { exact: true }).click();
  await studio
    .getByLabel('Texto de cierre', { exact: true })
    .fill('Hasta la próxima LAN');
  const downloadPromise = page.waitForEvent('download');
  await studio
    .getByRole('button', { name: 'Descargar PNG horizontal', exact: true })
    .click();
  const download = await downloadPromise;
  const meta = await sharp(await readFile((await download.path())!)).metadata();
  expect([meta.width, meta.height]).toEqual([1920, 1080]);
});

for (const width of [390, 1440])
  test(`Vertical TikTok exports native dimensions and transparent game at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/info/streamers/#minecraft');
    const studio = page.locator('[data-broadcast-studio]');
    const canvas = studio.locator(
      '[data-studio-view="vertical"] [data-studio-canvas]',
    );
    await expect(canvas).toHaveAttribute('width', '1080');
    await expect(canvas).toHaveAttribute('height', '1920');
    await expect(studio.locator('[data-studio-preview-label]')).toContainText(
      'Ambos formatos',
    );
    const dimensions = await studio
      .locator('[data-studio-view="vertical"] [data-studio-preview]')
      .boundingBox();
    expect(dimensions!.width / dimensions!.height).toBeCloseTo(9 / 16, 2);
    const downloadPromise = page.waitForEvent('download');
    await studio
      .getByRole('button', { name: 'Descargar PNG vertical', exact: true })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      'ulp-minecraft-live-1080x1920.png',
    );
    const { data, info } = await sharp(await readFile((await download.path())!))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([info.width, info.height]).toEqual([1080, 1920]);
    const pixel = (x: number, y: number) =>
      Array.from(data.subarray((y * 1080 + x) * 4, (y * 1080 + x) * 4 + 4));
    expect(pixel(400, 700)[3]).toBe(0);
    expect(pixel(700, 1400)[3]).toBe(0);
    expect(pixel(80, 1800)[3]).toBe(255);
    expect(pixel(80, 1800).slice(0, 3)).not.toEqual([245, 240, 230]);
    await studio
      .getByRole('button', { name: 'Ampliar diseño vertical', exact: true })
      .click();
    const expanded = studio
      .getByRole('dialog')
      .locator('[data-studio-preview]');
    const box = await expanded.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(9 / 16, 2);
    await page.keyboard.press('Escape');
    await studio.getByRole('button', { name: 'Inicio', exact: true }).click();
    await expect(canvas).toHaveAttribute('height', '1920');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });

test('Multistream ZIP includes matching horizontal and vertical assets and OBS capture placements', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/streamers/#concierto');
  const studio = page.locator('[data-broadcast-studio]');
  await studio
    .getByLabel('Nombre del canal', { exact: true })
    .fill('ULP Multistream');
  const promise = page.waitForEvent('download');
  await studio.getByRole('button', { name: 'Pack OBS', exact: false }).click();
  const download = await promise;
  expect(download.suggestedFilename()).toBe(
    'ulp-studio-obs-concierto-multistream.zip',
  );
  const files = unpack(await readFile((await download.path())!));
  expect(files.size).toBe(38);
  for (const output of ['horizontal', 'vertical']) {
    const vertical = output === 'vertical',
      w = vertical ? 1080 : 1920,
      h = vertical ? 1920 : 1080;
    const collection = JSON.parse(
      files.get(`${output}/coleccion-ulp.json`)!.toString(),
    );
    expect(collection.resolution).toEqual({ x: w, y: h });
    expect(collection.name).toContain(
      output === 'vertical' ? 'Vertical' : 'Horizontal',
    );
    const live = collection.sources.find(
      (s: { name: string }) => s.name === 'Partida',
    );
    expect(live.settings).toMatchObject({ custom_size: true, cx: w, cy: h });
    const game = live.settings.items.find(
      (i: { name: string }) => i.name === 'Tu juego',
    );
    expect(game.pos).toEqual(vertical ? { x: 36, y: 197 } : { x: 40, y: 132 });
    expect(game.bounds).toEqual(
      vertical ? { x: 1008, y: 567 } : { x: 1472, y: 828 },
    );
    expect(game.bounds.x / game.bounds.y).toBeCloseTo(16 / 9, 5);
    const cam = live.settings.items.find(
      (i: { name: string }) => i.name === 'Tu webcam',
    );
    expect(cam.pos).toEqual(
      vertical ? { x: 64, y: 1120 } : { x: 1552, y: 132 },
    );
    for (const source of collection.sources.filter(
      (s: { id: string }) => s.id === 'image_source',
    )) {
      const file = files.get(`${output}/${source.settings.file.slice(2)}`);
      expect(file).toBeTruthy();
      const meta = await sharp(file).metadata();
      expect([meta.width, meta.height]).toEqual([w, h]);
    }
    const dual = collection.sources.find(
      (source: { name: string }) => source.name === 'Doble webcam',
    );
    expect(
      dual.settings.items.map((item: { name: string }) => item.name),
    ).toEqual([
      'ULP · Fondo',
      'Tu webcam',
      'Tu webcam 2',
      'ULP · Doble webcam',
    ]);
    expect(dual.settings.items[1].pos).toEqual(
      vertical ? { x: 104, y: 320 } : { x: 84, y: 314 },
    );
    expect(dual.settings.items[2].pos).toEqual(
      vertical ? { x: 104, y: 960 } : { x: 1004, y: 314 },
    );
    const animated = collection.sources.filter(
      (source: { id: string }) => source.id === 'browser_source',
    );
    expect(animated).toHaveLength(8);
    for (const source of animated) {
      expect(source.settings).toMatchObject({
        is_local_file: true,
        width: w,
        height: h,
        shutdown: true,
        restart_when_active: true,
        fps: 20,
      });
      const html = files
        .get(`${output}/${source.settings.local_file.slice(2)}`)!
        .toString();
      expect(html).toContain('data:image/svg+xml;base64,');
      expect(html).toContain('SIL Open Font License');
      expect(html).toContain('drawStudio');
    }
    const bg = await sharp(files.get(`${output}/recursos/fondo.png`))
      .ensureAlpha()
      .raw()
      .toBuffer();
    const start = await sharp(files.get(`${output}/recursos/inicio.png`))
      .ensureAlpha()
      .raw()
      .toBuffer();
    const corner = ((h - 70) * w + 70) * 4;
    expect(bg.subarray(corner, corner + 4)).toEqual(
      start.subarray(corner, corner + 4),
    );
    const chat = collection.sources.find(
      (source: { name: string }) => source.name === 'Tu chat',
    );
    expect(chat.settings).toMatchObject({
      custom_size: true,
      cx: vertical ? 848 : 480,
      cy: vertical ? 424 : 720,
      items: [],
    });
    for (const name of [
      'Inicio',
      'Pausa',
      'Cuenta atrás',
      'Webcam',
      'Entrevista',
    ]) {
      const scene = collection.sources.find(
        (source: { name: string }) => source.name === name,
      );
      const layer = scene.settings.items.find(
        (item: { name: string }) => item.name === 'Tu chat',
      );
      expect(layer).toBeTruthy();
      expect(scene.settings.items.at(-1).name).toContain('ULP');
    }
    const help = files.get(`${output}/IMPORTAR-EN-OBS.txt`)!.toString();
    expect(help).toContain(`${w} × ${h}`);
    expect(help).toContain('dos colecciones independientes');
  }
});

for (const output of ['horizontal', 'vertical'])
  test(`Double webcam exports two transparent independent frames in the three supported styles: ${output}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.addInitScript(() => {
      const proto = CanvasRenderingContext2D.prototype,
        original = proto.fillText;
      (window as any).studioLabels = [];
      proto.fillText = function (text: string, ...args: any[]) {
        (window as any).studioLabels.push(text);
        return original.call(this, text, ...(args as [number, number]));
      };
    });
    await page.goto('/info/streamers/#minecraft');
    const studio = page.locator('[data-broadcast-studio]');
    await studio
      .getByRole('button', { name: 'Doble webcam', exact: true })
      .click();
    await studio
      .getByLabel('Texto de la segunda webcam', { exact: true })
      .fill('Invitada ULP');
    await expect(
      studio.locator(
        '[data-studio-view="horizontal"] [data-studio-camera-demo-second]',
      ),
    ).toBeVisible();
    await expect(
      studio.locator(`[data-studio-view="${output}"] [data-studio-canvas]`),
    ).toHaveAttribute('aria-label', /Invitada ULP/);
    for (const button of await studio.locator('[data-studio-design]').all()) {
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      const promise = page.waitForEvent('download');
      await studio
        .getByRole('button', { name: `Descargar PNG ${output}`, exact: true })
        .click();
      const download = await promise;
      expect(download.suggestedFilename()).toContain('-dual-');
      const { data, info } = await sharp(
        await readFile((await download.path())!),
      )
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const vertical = output === 'vertical';
      const alpha = (x: number, y: number) =>
        data[(y * info.width + x) * 4 + 3];
      expect(alpha(vertical ? 400 : 400, vertical ? 500 : 400)).toBe(0);
      expect(alpha(vertical ? 400 : 1200, vertical ? 1100 : 400)).toBe(0);
      const x = vertical ? 112 : 92,
        y = vertical ? 780 : 800;
      const color = Array.from(
        data.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 3),
      );
      expect(color).not.toEqual([245, 240, 230]);
    }
    expect(
      await page.evaluate(() =>
        (window as any).studioLabels.includes('ON AIR'),
      ),
    ).toBe(false);
    await studio.getByRole('button', { name: 'Inicio', exact: true }).click();
    const introPromise = page.waitForEvent('download');
    await studio
      .getByRole('button', { name: `Descargar PNG ${output}`, exact: true })
      .click();
    const intro = await introPromise;
    const { data: introData, info: introInfo } = await sharp(
      await readFile((await intro.path())!),
    )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const ix = output === 'vertical' ? 80 : 96,
      iy = output === 'vertical' ? 800 : 870;
    const introPixel = Array.from(
      introData.subarray(
        (iy * introInfo.width + ix) * 4,
        (iy * introInfo.width + ix) * 4 + 4,
      ),
    );
    expect(introPixel[3]).toBe(255);
    expect(introPixel.slice(0, 3)).not.toEqual([245, 240, 230]);
    const svgResponse = await page.request.get(
      '/assets/prensa/ugr-lan-party-blanco.svg',
    );
    expect(svgResponse.ok()).toBe(true);
    expect(await svgResponse.text()).toContain('Logo blanco');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
