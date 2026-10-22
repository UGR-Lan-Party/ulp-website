import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeSharedAgenda,
  decodeSharedAgenda,
  createSharedAgendaUrl,
} from '../src/utils/agenda-sharing.js';
const entries = [
  { key: '2026:ajedrez:2026-03-21T10:00:00+01:00' },
  { key: '2026:lol:2026-03-21T11:00:00+01:00' },
];
test('Una agenda compartida contiene solo IDs y valida edición y catálogo', () => {
  const selection = new Set(entries.map((entry) => entry.key));
  const encoded = encodeSharedAgenda(selection, entries, 2026);
  assert.deepEqual(decodeSharedAgenda(encoded, entries, 2026), selection);
  assert.equal(decodeSharedAgenda(encoded, entries, 2027), null);
  assert.equal(decodeSharedAgenda(encoded, [...entries].reverse(), 2026), null);
  assert.equal(encodeSharedAgenda(new Set(), entries, 2026), null);
  const url = new URL(
    createSharedAgendaUrl(selection, entries, 2026, 'https://ulp.ugr.es'),
  );
  assert.equal(url.search, '');
  assert.equal(url.pathname, '/info/horarios/');
  assert(!url.href.includes('ajedrez'));
  assert(url.hash.startsWith('#agenda=v1.2026.'));
});
test('La importación rechaza HTML, formatos abusivos e índices fuera del catálogo', () => {
  for (const value of [
    '<img src=x onerror=alert(1)>',
    'v1.2026.x.99999999999999999999',
    'a'.repeat(3000),
    null,
    'javascript:alert(1)',
  ])
    assert.equal(decodeSharedAgenda(value, entries, 2026), null);
  const valid = encodeSharedAgenda(new Set([entries[0].key]), entries, 2026);
  assert.equal(
    decodeSharedAgenda(valid.replace(/0$/, 'zzz'), entries, 2026),
    null,
  );
});
