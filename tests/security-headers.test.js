import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSecurityHeaders } from '../scripts/check-security-headers.mjs';

test('La verificación rechaza respuestas sin protección efectiva contra clickjacking', () => {
  const headers = new Headers({
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy':
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  assert.doesNotThrow(() => assertSecurityHeaders({ headers }, '/'));
  for (const header of [
    'x-frame-options',
    'content-security-policy',
    'x-content-type-options',
    'referrer-policy',
  ]) {
    const missing = new Headers(headers);
    missing.delete(header);
    assert.throws(() =>
      assertSecurityHeaders({ headers: missing }, '/404.html'),
    );
  }
  headers.set(
    'Content-Security-Policy',
    "frame-ancestors https://evil.invalid; base-uri 'self'; object-src 'none'",
  );
  assert.throws(() => assertSecurityHeaders({ headers }, '/'));
});
