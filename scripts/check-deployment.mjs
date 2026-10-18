import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function checkDeployment(baseUrl, expectedCommit) {
  const base = new URL(baseUrl);
  for (const route of ['/', '/actividades/ajedrez/']) {
    const response = await fetch(new URL(route, base), {
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    assert.equal(response.status, 200, `Respuesta incorrecta: ${route}`);
    assert.match(
      await response.text(),
      /<main[\s>]/,
      `Falta contenido: ${route}`,
    );
  }
  const response = await fetch(new URL('/version.json', base), {
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, 200, 'No se puede identificar la versión');
  const version = await response.json();
  assert.equal(
    version.commit,
    expectedCommit,
    'La versión servida no coincide con la esperada',
  );
  return version;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [, , base, expected] = process.argv;
  if (!base || !expected)
    throw new Error('Uso: node scripts/check-deployment.mjs URL COMMIT');
  const version = await checkDeployment(base, expected);
  console.log(`Portada, ficha y versión correctas: ${version.commit}`);
}
