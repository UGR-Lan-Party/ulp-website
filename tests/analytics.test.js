import assert from 'node:assert/strict';
import test from 'node:test';
import { createEventPayload } from '../src/utils/analytics.js';

test('Los eventos solo añaden edición y actividad, sin datos personales ni parámetros', () => {
  const result = createEventPayload(
    {
      website: 'website-id',
      hostname: 'ulp.ugr.es',
      screen: '360x800',
      language: 'es',
      id: 'private-id',
      data: { email: 'private@example.invalid' },
      referrer: 'https://example.invalid/?token=private',
    },
    {
      name: 'rules-click',
      edition: '2026',
      activity: 'ajedrez',
      path: '/actividades/ajedrez/?email=private#token',
    },
  );
  assert.deepEqual(result, {
    website: 'website-id',
    hostname: 'ulp.ugr.es',
    screen: '360x800',
    language: 'es',
    url: '/actividades/ajedrez/',
    name: 'rules-click',
    data: { edition: '2026', activity: 'ajedrez' },
  });
});
