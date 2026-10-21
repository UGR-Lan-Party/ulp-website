import test from 'node:test';
import assert from 'node:assert/strict';
import { freePlayExperiences, matchFreePlay } from '../src/utils/free-play.js';
test('Experience suggestions combine time, group and preferences without changing the catalog', () => {
  assert.equal(matchFreePlay().length, 8);
  const short = matchFreePlay({ time: '15', group: 'solo', mood: 'explore' });
  assert.ok(short.some((item) => item.id === 'vr'));
  assert.ok(!short.some((item) => item.id === 'hacking'));
  const shared = matchFreePlay({ group: 'group', mood: 'share' });
  assert.ok(shared.some((item) => item.id === 'futbolin'));
  assert.ok(!shared.some((item) => item.id === 'vr'));
  assert.equal(new Set(freePlayExperiences.map((item) => item.id)).size, 8);
  assert.ok(
    freePlayExperiences.every(
      (item) => item.minutes > 0 && item.location && item.plan,
    ),
  );
  for (const input of [
    { time: '0' },
    { time: '<script>' },
    { group: '__proto__' },
    { mood: 'javascript:alert(1)' },
  ])
    assert.throws(() => matchFreePlay(input));
  assert.equal(freePlayExperiences.length, 8);
});
