import program from '../src/data/program-2026.json' with { type: 'json' };
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  studioSettings,
  studioPattern,
  topographicSegments,
  countdownText,
  broadcastLayout,
  broadcastProfiles,
  captureSize,
  profileFor,
  markerMode,
  studioScenes,
  studioSize,
} from '../src/utils/broadcast-design.js';
import { obsUuid } from '../src/utils/obs-scene-collection.js';
test('El estudio limita texto, números, diseños y formatos sin interpretar HTML', () => {
  const s = studioSettings({
    channel: ' A\u0000\u202e  B ',
    webcamLabel: '😀'.repeat(70),
    scoreA: '999999',
    scoreB: '-9',
    ratio: '</select>',
    position: 'https://example.com',
    design: 'url(evil)',
    title: '<svg onload=alert(1)>',
  });
  assert.equal(s.channel, 'A B');
  assert.equal([...s.webcamLabel].length, 36);
  assert.equal(s.scoreA, 99);
  assert.equal(s.scoreB, 0);
  assert.equal(s.ratio, '16:9');
  assert.equal(s.position, 'right');
  assert.equal(s.design, 'arena');
  assert.equal(studioSettings({ design: 'beige' }).design, 'arena');
  assert.equal(s.title, '<svg onload=alert(1)>');
  assert.equal(studioSettings(null).channel, 'UGR LAN Party');
  assert(studioScenes.includes('rotulo') && studioScenes.includes('marcador'));
});
test('Los identificadores de escenas funcionan sin crypto.randomUUID y son únicos', () => {
  const ids = Array.from({ length: 100 }, obsUuid);
  assert.equal(new Set(ids).size, 100);
  assert(
    ids.every((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        id,
      ),
    ),
  );
});

test('Countdown clamps duration and formats wall-clock remainder without negative or non-finite output', () => {
  assert.equal(studioSettings().countdownMinutes, 5);
  assert.equal(
    studioSettings({ countdownMinutes: Infinity }).countdownMinutes,
    5,
  );
  assert.equal(studioSettings({ countdownMinutes: -10 }).countdownMinutes, 1);
  assert.equal(
    studioSettings({ countdownMinutes: 99999 }).countdownMinutes,
    180,
  );
  assert.equal(countdownText(300000), '05:00');
  assert.equal(countdownText(1), '00:01');
  assert.equal(countdownText(-500), '00:00');
  assert.equal(countdownText(Infinity), '00:00');
  assert.equal(countdownText(10800000), '3:00:00');
  assert(studioScenes.includes('countdown'));
});

test('Each catalogue activity has an explicit HUD and aspect decision, with record modes and non-competitive defaults', () => {
  for (const game of program.games)
    assert(Object.hasOwn(broadcastProfiles, game.id), game.id);
  for (const id of [
    'concierto',
    'general',
    'personalizada',
    ...program.talks.filter((t) => t.id !== 'charla-6').map((t) => t.id),
  ])
    assert(Object.hasOwn(broadcastProfiles, id));
  assert.equal(captureSize({ activityId: 'clash-royale' }).h, 1920);
  assert.equal(captureSize({ activityId: 'street-fighter' }).w, 1440);
  assert.equal(markerMode({ activityId: 'f1' }), 'record');
  assert.equal(markerMode({ activityId: 'concierto' }), 'off');
  assert.equal(
    profileFor({ activityId: '__proto__' }),
    broadcastProfiles.general,
  );
  const positions = new Set(
    program.games.map((game) =>
      JSON.stringify(broadcastProfiles[game.id].score),
    ),
  );
  assert(positions.size >= 15);
});
const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
test('All activity layouts keep HUD, camera labels, chat headers, scores and captions in separate bounds', () => {
  for (const activityId of Object.keys(broadcastProfiles))
    for (const output of ['horizontal', 'vertical'])
      for (const ratio of ['16:9', '4:3', '1:1'])
        for (const position of ['left', 'right'])
          for (const scene of studioScenes) {
            const s = { activityId, output, ratio, position },
              l = broadcastLayout(s, scene),
              size = studioSize(s);
            const regions = [
              ...(l.game ? [l.game] : []),
              ...l.cameras.map((c) => ({ ...c, h: c.h + 52 })),
              ...(l.chat
                ? [{ ...l.chat, y: l.chat.y - 44, h: l.chat.h + 44 }]
                : []),
              ...(l.score ? [{ ...l.score, h: l.score.h + 25 }] : []),
              ...(l.caption ? [l.caption] : []),
            ];
            for (const rect of regions) {
              assert(rect.x >= 20 && rect.y >= 20);
              assert(rect.x + rect.w <= size.w - 20);
              assert(rect.y + rect.h <= size.h - 20);
            }
            for (let i = 0; i < regions.length; i++)
              for (let j = i + 1; j < regions.length; j++)
                assert(
                  !overlap(regions[i], regions[j]),
                  JSON.stringify({ s, scene, i, j }),
                );
            if (l.game) {
              const native = captureSize(s);
              assert.equal(l.game.w / l.game.h, native.w / native.h);
            }
            for (const c of l.cameras) {
              const [a, b] = ratio.split(':').map(Number);
              assert.equal(c.w / c.h, a / b);
              assert(Number.isInteger(c.w) && Number.isInteger(c.h));
            }
          }
});
test('Native vertical feed stays in the upper half without a webcam, and chat can be removed without invisible capture holes', () => {
  const native = broadcastLayout({
    activityId: 'clash-royale',
    output: 'vertical',
    webcam: false,
  });
  assert(native.game.y >= 0 && native.game.y + native.game.h <= 960);
  assert.equal(native.cameras.length, 0);
  for (const output of ['horizontal', 'vertical'])
    for (const scene of [
      'inicio',
      'pausa',
      'countdown',
      'webcam',
      'interview',
    ]) {
      assert(broadcastLayout({ output }, scene).chat);
      assert.equal(broadcastLayout({ output, chat: false }, scene).chat, null);
    }
});

test('Logo has extra top breathing room and ULP nameplates stay compact', () => {
  assert.equal(broadcastLayout().logo.y, 40);
  assert.equal(broadcastLayout({ output: 'vertical' }).logo.y, 1000);
  assert.equal(
    broadcastLayout({
      activityId: 'clash-royale',
      output: 'vertical',
      webcam: false,
    }).logo.y,
    1000,
  );
  assert.equal(broadcastLayout().caption, null);
  const lower = broadcastLayout({}, 'rotulo').caption;
  assert(lower.x < 100 && lower.y > 850);
});
test('Topographic contour vectors are deterministic, finite and bounded; invalid dimensions never allocate a pattern', () => {
  const first = topographicSegments(640, 360),
    second = topographicSegments(640, 360);
  assert(first.length > 1000 && first.length < 30000);
  assert.deepEqual(first, second);
  for (const line of first) {
    assert.equal(line.length, 4);
    assert(line.every(Number.isFinite));
    assert(line[0] >= -72 && line[0] <= 724);
    assert(line[2] >= -72 && line[2] <= 724);
    assert(line[1] >= -72 && line[1] <= 444);
    assert(line[3] >= -72 && line[3] <= 444);
  }
  for (const [w, h] of [
    [0, 10],
    [-1, 200],
    [Infinity, 20],
    [10000, 10000],
  ])
    assert.deepEqual(topographicSegments(w, h), []);
});

test('Vertical gameplay stays above the fold for every activity and capture aspect, with camera and scores below', () => {
  for (const activityId of Object.keys(broadcastProfiles))
    for (const captureRatio of ['auto', '16:9', '4:3', '1:1', '9:16'])
      for (const webcam of [true, false]) {
        const l = broadcastLayout({
          activityId,
          captureRatio,
          webcam,
          output: 'vertical',
        });
        assert(
          l.game.y >= 0 && l.game.y + l.game.h <= 960,
          JSON.stringify({ activityId, captureRatio, webcam }),
        );
        assert(l.logo.y >= 960);
        if (l.score) assert(l.score.y >= 960);
        for (const c of l.cameras) assert(c.y >= 960);
      }
});
test('Each scene selects one background motif', () => {
  for (const scene of studioScenes)
    assert.equal(
      studioPattern(scene),
      ['inicio', 'countdown', 'final'].includes(scene) ? 'granada' : 'curves',
    );
});
