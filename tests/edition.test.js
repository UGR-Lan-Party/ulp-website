import assert from 'node:assert/strict';
import test from 'node:test';
import { getEditionPresentation } from '../src/utils/edition.js';
import { getCountdown } from '../src/utils/countdown.js';

test('Una edición sin fechas confirmadas no muestra una fecha inventada', () => {
  const result = getEditionPresentation({
    year: 2027,
    phase: 'announced',
    timezone: 'Europe/Madrid',
    startsAt: null,
    endsAt: null,
  });
  assert.equal(result.dates, 'Fechas por confirmar');
  assert.equal(result.action.href, '/info/about');
});

test('La edición de 2026 dirige a los horarios', () => {
  const result = getEditionPresentation({
    year: 2026,
    phase: 'finished',
    timezone: 'Europe/Madrid',
    startsAt: null,
    endsAt: null,
    archiveUrl: '/ediciones/2026',
  });
  assert.deepEqual(result.action, {
    label: 'Ver horarios',
    href: '/horarios',
  });
});

test('El inicio es el mismo instante desde distintas zonas', () => {
  const now = Date.parse('2026-03-20T13:45:00Z');
  assert.deepEqual(getCountdown('2026-03-20T15:45:00+01:00', now), {
    days: '00',
    hours: '01',
    minutes: '00',
    seconds: '00',
  });
});

for (const startsAt of ['2026-03-20T15:45:00+01:00', 'invalid']) {
  test(`Una fecha terminada o inválida oculta la cuenta atrás: ${startsAt}`, () => {
    assert.equal(
      getCountdown(startsAt, Date.parse('2026-03-21T00:00:00Z')),
      null,
    );
  });
}

test('Las demás ediciones conservan el destino de su archivo', () => {
  const result = getEditionPresentation({
    year: 2027,
    phase: 'finished',
    timezone: 'Europe/Madrid',
    startsAt: null,
    endsAt: null,
    archiveUrl: '/ediciones/2027',
  });
  assert.equal(result.action.href, '/ediciones/2027');
});
