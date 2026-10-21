import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tournamentFormats,
  getCapacityOptions,
  buildTournamentFormat,
  renderTournamentFormat,
} from '../src/utils/tournament-format.js';
const matches = (model) =>
  model.phases.flatMap((phase) => [
    ...(phase.rounds ?? []).flatMap((round) => round.matches),
    ...(phase.groups ?? []).flatMap((group) =>
      (group.rounds ?? []).flatMap((round) => round.matches),
    ),
  ]);
test('Every competition and challenge has a bounded dynamic model, never fabricated assignments or scores', () => {
  assert.equal(Object.keys(tournamentFormats).length, 20);
  for (const id of Object.keys(tournamentFormats))
    for (const capacity of getCapacityOptions(id)) {
      const model = buildTournamentFormat(id, capacity);
      assert.ok(model, id);
      assert.ok(model.phases.length > 0);
      for (const match of matches(model)) {
        assert.deepEqual(match.players, ['TBD', 'TBD']);
        assert.deepEqual(match.scores, [null, null]);
      }
      for (const phase of model.phases.filter(
        (phase) => phase.kind === 'groups' && phase.title === 'Fase de grupos',
      ))
        assert.equal(
          phase.groups.reduce((sum, g) => sum + g.size, 0),
          capacity,
        );
      const html = renderTournamentFormat(model);
      assert.ok(html.includes('TBD'));
      assert.ok(!html.includes('NaN'));
      assert.ok(!html.includes('undefined'));
    }
});
test('LoL and Rocket League follow the described group format and recalculate when capacity changes', () => {
  const lol = buildTournamentFormat('league-of-legends', 12);
  assert.deepEqual(
    lol.phases.map((p) => p.kind),
    ['groups', 'groups', 'bracket'],
  );
  assert.equal(lol.phases[0].groups.length, 3);
  assert.equal(lol.phases[1].groups[0].rounds.length, 3);
  assert.equal(lol.phases[2].rounds[0].matches.length, 2);
  assert.equal(
    buildTournamentFormat('league-of-legends', 16).phases[0].groups.length,
    4,
  );
  const rl = buildTournamentFormat('rocket-league', 10);
  assert.deepEqual(
    rl.phases[0].groups.map((g) => g.size),
    [5, 5],
  );
  assert.equal(rl.phases[0].groups[0].rounds.length, 5);
  assert.equal(rl.phases[1].rounds.length, 2);
});
test('Brawl preserves the specific non-adjacent semifinal links and BO formats', () => {
  const phase = buildTournamentFormat('brawl-stars', 16).phases.find(
    (p) => p.kind === 'bracket',
  );
  assert.deepEqual(
    phase.rounds[0].matches.map((m) => m.labels),
    [
      ['1.º Grupo A', '2.º Grupo B'],
      ['2.º Grupo A', '1.º Grupo B'],
      ['1.º Grupo C', '2.º Grupo D'],
      ['2.º Grupo C', '1.º Grupo D'],
    ],
  );
  assert.deepEqual(
    phase.rounds[0].matches.map((m) => m.nextId),
    ['playoff-1-0', 'playoff-1-1', 'playoff-1-1', 'playoff-1-0'],
  );
  assert.equal(phase.rounds.at(-1).detail, 'BO5');
});
test('Round-robin groups cover each pairing once including odd counts and no fictitious zero result', () => {
  for (const n of [12, 13, 16, 24, 64]) {
    const phase = buildTournamentFormat('ping-pong', n).phases[0];
    for (const group of phase.groups) {
      const list = group.rounds.flatMap((r) => r.matches),
        pairs = new Set(list.map((m) => m.labels.slice().sort().join('|')));
      assert.equal(list.length, (group.size * (group.size - 1)) / 2);
      assert.equal(pairs.size, list.length);
    }
  }
});
test('Swiss, racing and score challenges keep distinct formats and do not fabricate an elimination format', () => {
  assert.equal(
    buildTournamentFormat('clash-royale', 32).phases[0].rounds.length,
    5,
  );
  assert.equal(
    buildTournamentFormat('minecraft', 16).phases.filter((p) =>
      p.title.startsWith('Hunger Games'),
    ).length,
    5,
  );
  assert.deepEqual(
    buildTournamentFormat('wii-sports-bolos', 36).phases.map(
      (p) => p.rows.length,
    ),
    [36, 16, 8],
  );
  assert.ok(
    buildTournamentFormat('mario-kart', 64).phases.every((p) =>
      p.groups.every((g) => g.size <= 4),
    ),
  );
  for (const id of ['beat-saber', 'hacking', 'f1', 'retro', 'tetris', 'cars'])
    assert.ok(
      buildTournamentFormat(id, 16).phases.every((p) => p.kind === 'ranking'),
    );
});
test('Unknown keys, prototype properties, unbounded capacities and HTML are rejected or escaped', () => {
  for (const key of [
    '__proto__',
    'constructor',
    '<img src=x onerror=alert(1)>',
  ])
    assert.equal(buildTournamentFormat(key, 16), null);
  for (const n of [NaN, Infinity, -1, 0, 1, 65, 2.5, '16', null])
    assert.equal(buildTournamentFormat('smash', n), null);
  const model = buildTournamentFormat('smash', 8);
  model.phases[0].title = '<img src=x onerror=alert(1)>';
  assert.ok(!renderTournamentFormat(model).includes('<img'));
  assert.ok(renderTournamentFormat(model).includes('&lt;img'));
});
