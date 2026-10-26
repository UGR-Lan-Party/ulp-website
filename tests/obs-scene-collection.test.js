import test from 'node:test';
import assert from 'node:assert/strict';
import { buildObsCollection } from '../src/utils/obs-scene-collection.js';
import { createStoredZip } from '../src/utils/zip-store.js';
test('La colección OBS resuelve sus cinco escenas, capas y rutas relativas', () => {
  const data = buildObsCollection('Minecraft', false);
  assert.deepEqual(
    data.scene_order.map((s) => s.name),
    ['Inicio', 'Partida', 'Pausa', 'Final', 'Tu juego'],
  );
  assert.deepEqual(data.resolution, { x: 1920, y: 1080 });
  assert.equal(
    new Set(data.sources.map((s) => s.uuid)).size,
    data.sources.length,
  );
  const images = data.sources.filter((s) => s.id === 'image_source');
  assert.equal(images.length, 5);
  assert(
    images.every((s) => /^\.\/recursos\/[a-z]+\.png$/.test(s.settings.file)),
  );
  for (const scene of data.sources.filter((s) => s.id === 'scene'))
    for (const item of scene.settings.items) {
      assert(
        data.sources.some(
          (s) => s.uuid === item.source_uuid && s.name === item.name,
        ),
      );
      assert.deepEqual(item.bounds, { x: 1920, y: 1080 });
    }
  const live = data.sources.find((s) => s.name === 'Partida');
  assert.deepEqual(
    live.settings.items.map((i) => i.name),
    ['ULP · Fondo', 'Tu juego', 'ULP · Overlay personalizado'],
  );
  assert.equal(live.settings.items[0].visible, false);
  assert(data.sources.every((s) => ['image_source', 'scene'].includes(s.id)));
  assert.equal(data.current_scene, 'Inicio');
});
test('El ZIP del navegador usa rutas seguras, UTF-8 y CRC verificable', async () => {
  const bytes = new TextEncoder().encode('123456789');
  const blob = createStoredZip([{ name: 'recursos/prueba.png', bytes }]);
  assert.equal(blob.type, 'application/zip');
  const out = new Uint8Array(await blob.arrayBuffer()),
    view = new DataView(out.buffer);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint32(14, true), 0xcbf43926);
  assert.equal(view.getUint16(6, true), 0x800);
  const nameSize = view.getUint16(26, true);
  assert.equal(
    new TextDecoder().decode(out.subarray(30, 30 + nameSize)),
    'recursos/prueba.png',
  );
  assert.deepEqual(
    out.subarray(30 + nameSize, 30 + nameSize + bytes.length),
    bytes,
  );
  assert.equal(view.getUint32(out.length - 22, true), 0x06054b50);
  for (const name of [
    '../fuera',
    '/absoluto',
    'C:/archivo',
    'recursos/../fuera',
    'a\\b',
    'a\0b',
  ])
    assert.throws(() => createStoredZip([{ name, bytes }]));
  assert.throws(() =>
    createStoredZip([
      { name: 'a', bytes },
      { name: 'a', bytes },
    ]),
  );
});
