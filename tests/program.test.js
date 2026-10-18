import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateProgram, formatSlot } from '../src/utils/program.js';

const source = JSON.parse(
  readFileSync(
    new URL('../src/data/program-2026.json', import.meta.url),
    'utf8',
  ),
);

test('El catálogo completo de 2026 es válido', () =>
  assert.doesNotThrow(() => validateProgram(source)));
test('Los identificadores duplicados se rechazan', () => {
  const data = structuredClone(source);
  data.games.push(data.games[0]);
  assert.throws(() => validateProgram(data), /duplicado/);
});
test('Un fin anterior al inicio se rechaza', () => {
  const data = structuredClone(source);
  data.games[0].schedule[0].endsAt = '2026-03-20T00:00:00+01:00';
  assert.throws(() => validateProgram(data), /intervalo inválido/);
});
test('Una actividad sin tarjeta se rechaza', () => {
  const data = structuredClone(source);
  delete data.games[0].card;
  assert.throws(() => validateProgram(data), /Falta tarjeta/);
});
test('La hora mostrada procede del intervalo y de la zona configurada', () => {
  assert.equal(
    formatSlot(
      {
        startsAt: '2026-03-21T09:00:00Z',
        endsAt: '2026-03-21T10:00:00Z',
        allDay: false,
      },
      'Europe/Madrid',
    ),
    '10:00–11:00',
  );
});
