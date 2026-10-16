import assert from 'node:assert/strict';
import test from 'node:test';
import {
  agendaEntryId,
  parseAgenda,
  findAgendaConflicts,
  createAgendaCalendar,
} from '../src/utils/personal-agenda.js';

const first = {
  key: '2026:ajedrez:1',
  id: 'ajedrez',
  name: 'Ajedrez',
  location: 'Sala de estudiantes',
  label: 'Final',
  startsAt: '2026-03-21T10:00:00+01:00',
  endsAt: '2026-03-21T11:00:00+01:00',
  href: '/actividades/ajedrez',
};

test('La selección local admite solo identificadores conocidos y elimina duplicados', () => {
  const allowed = new Set(['uno', 'dos']);
  assert.deepEqual(
    [...parseAgenda('["uno","uno","<script>",42,"dos"]', allowed)],
    ['uno', 'dos'],
  );
  assert.equal(parseAgenda('{"uno":true}', allowed).size, 0);
  assert.equal(parseAgenda('JSON roto', allowed).size, 0);
  assert.notEqual(agendaEntryId(first, 2026), agendaEntryId(first, 2027));
});

test('Los solapamientos respetan los límites y no inventan duración para una franja sin fin', () => {
  const overlap = {
    ...first,
    key: 'dos',
    startsAt: '2026-03-21T10:30:00+01:00',
    endsAt: '2026-03-21T11:30:00+01:00',
  };
  assert.equal(findAgendaConflicts([first, overlap]).length, 1);
  assert.equal(
    findAgendaConflicts([first, { ...overlap, startsAt: first.endsAt }]).length,
    0,
  );
  assert.equal(
    findAgendaConflicts([first, { ...overlap, endsAt: null }]).length,
    0,
  );
  assert.equal(
    findAgendaConflicts([
      first,
      {
        ...overlap,
        startsAt: '2026-03-22T10:30:00+01:00',
        endsAt: '2026-03-22T11:30:00+01:00',
      },
    ]).length,
    0,
  );
});

test('El calendario convierte a UTC, conserva UID y distingue una hora final ausente', () => {
  const calendar = createAgendaCalendar(
    [first],
    2026,
    new Date('2026-10-16T10:00:00Z'),
  );
  assert.ok(calendar.includes('DTSTART:20260321T090000Z\r\n'));
  assert.ok(calendar.includes('DTEND:20260321T100000Z\r\n'));
  assert.ok(calendar.includes('UID:2026%3Aajedrez%3A1@ulp.ugr.es'));
  assert.ok(calendar.endsWith('END:VCALENDAR\r\n'));
  const noEnd = createAgendaCalendar([{ ...first, endsAt: null }], 2026);
  assert.ok(!noEnd.includes('DTEND:'));
  assert.ok(noEnd.includes('Hora de fin sin confirmar.'));
  const summer = createAgendaCalendar(
    [{ ...first, startsAt: '2027-04-01T10:00:00+02:00' }],
    2027,
  );
  assert.ok(summer.includes('DTSTART:20270401T080000Z'));
});

test('El calendario escapa texto y pliega líneas por bytes sin cortar caracteres Unicode', () => {
  const calendar = createAgendaCalendar(
    [
      {
        ...first,
        name: 'Árbol, torre; final\\\nBEGIN:VEVENT ' + '🎮'.repeat(40),
      },
    ],
    2026,
  );
  const lines = calendar.split('\r\n');
  assert.ok(lines.every((line) => Buffer.byteLength(line, 'utf8') <= 75));
  const unfolded = calendar.replace(/\r\n /g, '');
  assert.equal(
    unfolded.split('\r\n').filter((line) => line === 'BEGIN:VEVENT').length,
    1,
  );
  assert.ok(unfolded.includes('Árbol\\, torre\\;'));
  assert.ok(unfolded.includes('🎮'.repeat(40)));
  assert.ok(!unfolded.includes('\uFFFD'));
});
