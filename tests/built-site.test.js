import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkBuiltSite } from '../scripts/check-built-site.mjs';

test('El verificador distingue rutas, recursos y destinos externos', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'ulp-site-'));
  try {
    await mkdir(path.join(root, 'actividad'));
    await writeFile(
      path.join(root, 'actividad/index.html'),
      '<h1>Actividad</h1>',
    );
    await writeFile(path.join(root, 'foto.webp'), 'fixture');
    await writeFile(
      path.join(root, 'index.html'),
      '<a href="/actividad/">Actividad</a><a href="https://example.invalid/">Externo</a><img src="/foto.webp"><meta http-equiv="refresh" content="0;url=/actividad/">',
    );
    assert.deepEqual(await checkBuiltSite(root), []);
    await writeFile(
      path.join(root, 'index.html'),
      '<a href="/no-existe/">Rota</a><img><img src="/ausente.webp">',
    );
    const failures = await checkBuiltSite(root);
    assert.equal(failures.length, 3);
    assert.ok(failures.some((message) => message.includes('no-existe')));
    assert.ok(failures.some((message) => message.includes('ausente.webp')));
    assert.ok(failures.some((message) => message.includes('imagen sin src')));
  } finally {
    assert.ok(root.startsWith(path.join(tmpdir(), 'ulp-site-')));
    await rm(root, { recursive: true, force: true });
  }
});
