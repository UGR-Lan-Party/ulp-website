import assert from 'node:assert/strict';
import test from 'node:test';
import {
  matchesProgramFilters,
  normalizeSearch,
  parseTime,
} from '../src/utils/program-filters.js';

const entry = {
  name: 'Torneo de Ajedrez',
  location: 'Aula 1.1',
  day: '2026-03-21',
  start: '10:00',
  end: '14:00',
};

test('La búsqueda ignora mayúsculas, tildes y espacios repetidos', () => {
  assert.equal(normalizeSearch('  AJEDRÉZ  '), 'ajedrez');
  assert.equal(
    matchesProgramFilters(entry, { name: 'TORNEO   de AJEDRÉZ' }),
    true,
  );
  assert.equal(matchesProgramFilters(entry, { name: 'Minecraft' }), false);
});
test('Día, ubicación, nombre y hora se combinan', () => {
  assert.equal(
    matchesProgramFilters(entry, {
      name: 'ajedrez',
      location: 'Aula 1.1',
      day: '2026-03-21',
      time: '12:30',
    }),
    true,
  );
  assert.equal(matchesProgramFilters(entry, { location: 'Otra aula' }), false);
  assert.equal(matchesProgramFilters(entry, { day: '2026-03-20' }), false);
});
test('La hora incluye el inicio y excluye el final de una franja', () => {
  for (const time of ['10:00', '13:59'])
    assert.equal(matchesProgramFilters(entry, { time }), true);
  for (const time of ['09:59', '14:00', '25:00', '<script>'])
    assert.equal(matchesProgramFilters(entry, { time }), false);
  assert.equal(parseTime('24:00'), null);
});
test('Sin fin confirmado solo se usa el comienzo; las franjas nocturnas se conservan', () => {
  assert.equal(
    matchesProgramFilters({ ...entry, end: '' }, { time: '10:00' }),
    true,
  );
  assert.equal(
    matchesProgramFilters({ ...entry, end: '' }, { time: '10:30' }),
    false,
  );
  assert.equal(
    matchesProgramFilters(
      { ...entry, start: '23:00', end: '01:00' },
      { time: '00:30' },
    ),
    true,
  );
});
test('Los caracteres de HTML o expresiones regulares se buscan como texto literal', () => {
  for (const name of ['<img src=x onerror=alert(1)>', '.*', '[ajedrez]'])
    assert.equal(matchesProgramFilters(entry, { name }), false);
});
