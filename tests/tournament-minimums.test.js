import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCapacityOptions,
  tournamentFormats,
  buildTournamentFormat,
} from '../src/utils/tournament-format.js';
test('Each competition enforces its own reasonable minimum and Minecraft keeps complete pairs', () => {
  for (const [id, config] of Object.entries(tournamentFormats)) {
    const choices = getCapacityOptions(id);
    assert.equal(choices[0], config.minimum);
    assert.ok(config.minimum >= 4);
    assert.ok(choices.includes(config.capacity));
    for (let n = 1; n < config.minimum; n++)
      assert.equal(buildTournamentFormat(id, n), null, `${id}/${n}`);
  }
  assert.equal(getCapacityOptions('wii-sports-tenis')[0], 12);
  assert.equal(getCapacityOptions('wii-sports-bolos')[0], 16);
  assert.ok(getCapacityOptions('minecraft').every((n) => n % 2 === 0));
  assert.equal(buildTournamentFormat('minecraft', 9), null);
});
