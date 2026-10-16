import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { validateTournaments } from '../src/utils/tournaments.js';

const data = JSON.parse(
  readFileSync(new URL('../src/data/tournaments-2026.json', import.meta.url)),
);

test('Los cuadros públicos rechazan campos privados y datos de contacto', () => {
  assert.equal(validateTournaments(data), data);
  for (const change of [
    (copy) => (copy.tournaments[0].email = 'privado'),
    (copy) =>
      copy.tournaments[0].participants.push('nick usuario@example.test'),
    (copy) => copy.tournaments[0].participants.push('+34 612 345 678'),
  ]) {
    const copy = structuredClone(data);
    change(copy);
    assert.throws(() => validateTournaments(copy));
  }
});

test('Cada grupo de ping pong conserva sus tres cruces y sus participantes, sin deducir ganadores', () => {
  const ping = data.tournaments.find((item) => item.id === 'ping-pong');
  assert.equal(ping.groups.length, 8);
  assert.equal(ping.groups.flatMap((group) => group.matches).length, 24);
  for (const group of ping.groups) {
    assert.equal(group.participants.length, 3);
    const pairs = new Set(
      group.matches.map((match) => [...match.players].sort().join('|')),
    );
    assert.equal(pairs.size, 3);
    for (const player of group.participants)
      assert.equal(
        group.matches.filter((match) => match.players.includes(player)).length,
        2,
      );
  }
  const invalid = structuredClone(data);
  invalid.tournaments[0].groups[0].matches[0].players[0] =
    'No pertenece al grupo';
  assert.throws(() => validateTournaments(invalid));
});

test('Los resultados parciales conservan ceros y ausencias por separado', () => {
  const mario = data.tournaments.find((item) => item.id === 'mario-kart');
  const reader = mario.tables[0].rows.find((row) => row[0] === 'Reader');
  assert.deepEqual(reader, ['Reader', 0, null]);
  const minecraft = data.tournaments.find((item) => item.id === 'minecraft');
  assert.equal(minecraft.groups.length, 6);
  assert.ok(minecraft.groups.every((group) => group.participants.length === 2));
  assert.deepEqual(
    minecraft.tables[0].rows.find((row) => row[0] === 'IAmFernandez'),
    ['IAmFernandez', null, null],
  );
});

test('Las listas de inscritos no se convierten en cruces inventados', () => {
  for (const tournament of data.tournaments.filter(
    (item) => item.id !== 'ping-pong',
  ))
    assert.equal(tournament.groups.flatMap((group) => group.matches).length, 0);
});

test('Smash conserva 63 partidos reales y valida el avance de sus ganadores', () => {
  const smash = data.tournaments.find((item) => item.id === 'smash');
  const matches = smash.brackets.flatMap((bracket) =>
    bracket.rounds.flatMap((round) => round.matches),
  );
  assert.equal(matches.length, 63);
  const final = smash.brackets[0].rounds.at(-1).matches[0];
  assert.deepEqual(final.players, ['Paquito', 'bkrai']);
  assert.deepEqual(final.scores, [3, 1]);
  assert.equal(final.winner, 'Paquito');
  const invalid = structuredClone(data);
  invalid.tournaments.find(
    (item) => item.id === 'smash',
  ).brackets[0].rounds[0].matches[0].nextId = 'partido-inexistente';
  assert.throws(() => validateTournaments(invalid));
});
