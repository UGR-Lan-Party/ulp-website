import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
function unpack(bytes: Buffer) {
  const entries = new Map<string, Buffer>();
  let offset = 0;
  while (bytes.readUInt32LE(offset) === 0x04034b50) {
    const size = bytes.readUInt32LE(offset + 18),
      length = bytes.readUInt16LE(offset + 26),
      extra = bytes.readUInt16LE(offset + 28),
      name = bytes.subarray(offset + 30, offset + 30 + length).toString(),
      start = offset + 30 + length + extra;
    expect(bytes.readUInt16LE(offset + 8)).toBe(0);
    entries.set(name, bytes.subarray(start, start + size));
    offset = start + size;
  }
  return entries;
}
for (const width of [390, 1440])
  test(`El pack OBS respeta la configuración y se genera sin backend a ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
    await page.goto('/info/streamers/#minecraft');
    await page.locator('[data-stream-archive] > summary').click();
    const profile = page.locator('[data-stream-profile=minecraft]');
    await profile.getByRole('button', { name: 'Personalizar overlay' }).click();
    const form = profile.getByRole('form');
    await form.getByLabel('Equipo A', { exact: true }).fill('Granada');
    await form.getByLabel('Equipo B', { exact: true }).fill('ETSIIT');
    await form.getByLabel('Marcador A', { exact: true }).fill('4');
    await form.getByLabel('Marcador B', { exact: true }).fill('2');
    await form.getByLabel('Incluir marco original').uncheck();
    await profile
      .getByRole('checkbox', { name: 'Fondo', exact: true })
      .uncheck();
    const requests: { url: string; method: string }[] = [];
    page.on('request', (r) =>
      requests.push({ url: r.url(), method: r.method() }),
    );
    const promise = page.waitForEvent('download');
    await form
      .getByRole('button', { name: 'Descargar escenas para OBS' })
      .click();
    const download = await promise;
    expect(download.suggestedFilename()).toBe('ulp-obs-minecraft-2026.zip');
    const saved = info.outputPath('ulp-obs-minecraft-2026.zip');
    await download.saveAs(saved);
    const files = unpack(await readFile(saved));
    expect(files.size).toBe(7);
    const collection = JSON.parse(files.get('coleccion-ulp.json')!.toString());
    expect(collection.name).toBe('ULP 2026 · Minecraft');
    expect(collection.scene_order.map((s: { name: string }) => s.name)).toEqual(
      ['Inicio', 'Partida', 'Pausa', 'Final', 'Tu juego'],
    );
    for (const source of collection.sources.filter(
      (s: { id: string }) => s.id === 'image_source',
    ))
      expect(files.has(source.settings.file.slice(2))).toBe(true);
    expect(
      collection.sources.find((s: { name: string }) => s.name === 'Partida')
        .settings.items[0].visible,
    ).toBe(false);
    const image = await sharp(files.get('recursos/overlay.png'))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect([image.info.width, image.info.height]).toEqual([1920, 1080]);
    expect(image.data[(540 * 1920 + 960) * 4 + 3]).toBe(0);
    for (const kind of ['inicio', 'pausa', 'final']) {
      const meta = await sharp(files.get(`recursos/${kind}.png`)).metadata();
      expect([meta.width, meta.height]).toEqual([1920, 1080]);
    }
    expect(files.get('IMPORTAR-EN-OBS.txt')!.toString()).toContain('Tu juego');
    expect(requests.every((r) => r.method === 'GET')).toBe(true);
    expect(requests.some((r) => r.url.includes('Granada'))).toBe(false);
    await expect(form.getByRole('status')).toContainText('Pack OBS listo');
    await expect(
      form.getByRole('button', { name: 'Descargar escenas para OBS' }),
    ).toBeEnabled();
  });
