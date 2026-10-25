import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateRawSync } from 'node:zlib';
import kit from '../src/data/stream-kit.json' with { type: 'json' };

test('Los PNG del kit conservan los originales, dimensiones y formato 16:9 declarados', () => {
  assert.equal(kit.assets.length, 7);
  for (const asset of kit.assets) {
    const png = readFileSync(
      new URL('../public' + asset.file, import.meta.url),
    );
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), asset.width);
    assert.equal(png.readUInt32BE(20), asset.height);
    assert.equal(asset.width / asset.height, 16 / 9);
    assert.equal(createHash('sha256').update(png).digest('hex'), asset.sha256);
  }
});
test('Cada ZIP contiene exactamente las capas de su juego y los PNG íntegros', () => {
  for (const profile of [
    ...kit.profiles,
    { id: 'completo', assets: kit.assets.map((a) => a.id), zip: kit.zip },
  ]) {
    const zip = readFileSync(
      new URL('../public' + profile.zip, import.meta.url),
    );
    let offset = 0;
    const names = [];
    while (zip.readUInt32LE(offset) === 0x04034b50) {
      const method = zip.readUInt16LE(offset + 8),
        size = zip.readUInt32LE(offset + 18),
        nameSize = zip.readUInt16LE(offset + 26),
        extraSize = zip.readUInt16LE(offset + 28);
      const name = zip.subarray(offset + 30, offset + 30 + nameSize).toString();
      assert(!name.includes('..') && !name.startsWith('/'));
      const start = offset + 30 + nameSize + extraSize,
        compressed = zip.subarray(start, start + size),
        content = method === 8 ? inflateRawSync(compressed) : compressed;
      const asset = kit.assets.find((a) => name === `${a.kind}/${a.id}.png`);
      assert(asset, `Archivo no previsto: ${name}`);
      assert(profile.assets.includes(asset.id));
      assert.equal(
        createHash('sha256').update(content).digest('hex'),
        asset.sha256,
      );
      names.push(asset.id);
      offset = start + size;
    }
    assert.deepEqual(names.sort(), [...profile.assets].sort());
  }
});
