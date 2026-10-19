import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { getLolStatsUrl } from '../src/utils/lol-stats.js';

const teams = JSON.parse(
  readFileSync(new URL('../src/data/lol-rosters-2026.json', import.meta.url)),
);

test('Los enlaces de OP.GG conservan espacios, caracteres Unicode y etiquetas', () => {
  assert.equal(
    getLolStatsUrl('Chicle de Menta#RANNI'),
    'https://op.gg/lol/summoners/euw/Chicle%20de%20Menta-RANNI',
  );
  assert.equal(
    getLolStatsUrl('細くて暗い男#MKOI'),
    'https://op.gg/lol/summoners/euw/%E7%B4%B0%E3%81%8F%E3%81%A6%E6%9A%97%E3%81%84%E7%94%B7-MKOI',
  );
  for (const value of [
    null,
    '',
    'Sin etiqueta',
    '#EUW',
    'Nombre#EUW#otro',
    'correo@example.com#EUW',
    'Nombre#EUW\nextra',
  ]) {
    assert.equal(getLolStatsUrl(value), null);
  }
});

test('Las plantillas de LoL contienen solo equipos y alias de juego con perfiles válidos', () => {
  assert.equal(teams.length, 14);
  assert.equal(new Set(teams.map((team) => team.name)).size, teams.length);
  let count = 0;
  for (const team of teams) {
    assert.deepEqual(Object.keys(team).sort(), [
      'name',
      'players',
      'substitutes',
    ]);
    assert.equal(team.players.length, 5);
    assert.ok(!team.name.includes('@'));
    for (const riotId of [...team.players, ...team.substitutes]) {
      assert.equal(typeof riotId, 'string');
      const url = new URL(getLolStatsUrl(riotId));
      assert.equal(url.origin, 'https://op.gg');
      assert.equal(url.search, '');
      assert.equal(url.hash, '');
      count++;
    }
  }
  assert.equal(count, 77);
});
