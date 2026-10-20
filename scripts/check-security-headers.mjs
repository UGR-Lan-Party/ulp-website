import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function assertSecurityHeaders(response, route) {
  assert.equal(
    response.headers.get('x-frame-options'),
    'DENY',
    `Falta X-Frame-Options en ${route}`,
  );
  const csp = response.headers.get('content-security-policy') ?? '';
  for (const directive of [
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ]) {
    assert.ok(
      csp.split(';').some((value) => value.trim() === directive),
      `Falta ${directive} en ${route}`,
    );
  }
  assert.equal(
    response.headers.get('x-content-type-options'),
    'nosniff',
    `Falta nosniff en ${route}`,
  );
  assert.equal(
    response.headers.get('referrer-policy'),
    'strict-origin-when-cross-origin',
    `Falta Referrer-Policy en ${route}`,
  );
}

export async function checkSecurityHeaders(baseUrl) {
  const cases = [
    ['/', 200],
    ['/actividades/ajedrez/', 200],
    ['/404.html', 200],
    ['/no-existe-seguridad', 404],
    ['/version.json', 200],
    ['/.env', 403],
    ['/.git/config', 403],
    ['/.well-known/acme-challenge/security-probe', 404],
  ];
  for (const [route, status] of cases) {
    const response = await fetch(new URL(route, baseUrl), {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    assert.equal(response.status, status, `Estado inesperado en ${route}`);
    assertSecurityHeaders(response, route);
    if (route === '/version.json')
      assert.equal(response.headers.get('cache-control'), 'no-store');
    if (route === '/' || route === '/404.html')
      assert.match(response.headers.get('content-type') ?? '', /^text\/html/);
    assert.ok(
      !/nginx\//i.test(response.headers.get('server') ?? ''),
      'La versión de Nginx se expone',
    );
    await response.arrayBuffer();
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (!process.argv[2])
    throw new Error('Uso: node scripts/check-security-headers.mjs URL');
  await checkSecurityHeaders(process.argv[2]);
  console.log(
    'Cabeceras, página de error, versión y bloqueo de archivos ocultos correctos.',
  );
}
