import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialSurveys,
  surveyChart,
  surveyLabel,
} from '../src/utils/initial-surveys.js';

test('Survey comparisons use question responses, retain missing options and align franchises', () => {
  assert.deepEqual(
    initialSurveys.map((s) => s.responses),
    [183, 171, 258, 342],
  );
  const chart = surveyChart({ all: true });
  const mario = chart.rows.find((r) => r.name === 'Mario Kart');
  assert.deepEqual(
    mario.values.map((v) => v.votes),
    [46, 66, 112, 130],
  );
  assert.equal(mario.values[3].value, (130 / 342) * 100);
  const wii = chart.rows.find((r) => r.name === 'Wii Sports (Tennis)');
  assert.equal(wii.values[0].value, null);
  assert.equal(surveyLabel(wii.values[0], 'percent'), 'No se preguntó');
  assert.deepEqual(
    chart.rows
      .find((r) => r.name === 'Rocket League')
      .values.map((v) => v.votes),
    [40, 51, 70, 72],
  );
  assert.deepEqual(
    chart.rows
      .find((r) => r.name === 'Counter-Strike')
      .values.map((v) => v.votes),
    [33, 38, 50, 74],
  );
  assert.equal(chart.max, 100);
  for (const edition of initialSurveys)
    for (const votes of Object.values(edition.votes))
      assert.ok(
        Number.isInteger(votes) && votes >= 0 && votes <= edition.responses,
      );
});

test('Edition and unit controls recalculate rankings and common scales', () => {
  const chart = surveyChart({ year: '2023', metric: 'votes', all: true });
  assert.equal(chart.editions.length, 1);
  assert.equal(chart.rows.length, 12);
  assert.equal(chart.max, 50);
  assert.equal(surveyChart().rows.length, 8);
  assert.ok(chart.rows.every((r) => r.values.length === 1));
  assert.throws(() => surveyChart({ year: '2022' }));
  assert.throws(() => surveyChart({ metric: 'invalid' }));
});

test('The public 2025 summary retains all 18 options and its 258-response denominator', () => {
  const edition = initialSurveys.find((s) => s.year === 2025);
  assert.equal(edition.responses, 258);
  assert.equal(Object.keys(edition.votes).length, 18);
  assert.equal(edition.votes['FIFA / EA Sports FC'], 55);
  const chart = surveyChart({ year: '2025', all: true });
  assert.equal(
    chart.rows.find((r) => r.name === 'Mario Kart').values[0].value,
    (112 / 258) * 100,
  );
  assert.equal(
    chart.rows.find((r) => r.name === 'Wii Sports (Tennis)').values[0].votes,
    109,
  );
});

test('Wii Sports maps to Tennis and Pokémon shares its Showdown series without changing votes', () => {
  const chart = surveyChart({ all: true });
  assert.deepEqual(
    chart.rows
      .find((r) => r.name === 'Wii Sports (Tennis)')
      .values.map((v) => v.votes),
    [null, 50, 109, 94],
  );
  assert.deepEqual(
    chart.rows
      .find((r) => r.name === 'Pokémon / Showdown')
      .values.map((v) => v.votes),
    [24, 42, 45, null],
  );
  assert.deepEqual(
    chart.rows
      .find((r) => r.name === 'Wii Sports (Bolos)')
      .values.map((v) => v.votes),
    [null, null, null, 81],
  );
  assert.ok(
    !chart.rows.some((r) =>
      ['Wii Sports', 'Pokémon', 'Pokémon Showdown'].includes(r.name),
    ),
  );
});

test('Games keep descending total-vote order across metrics and edition filters', () => {
  const total = (name) =>
    initialSurveys.reduce((sum, s) => sum + (s.votes[name] ?? 0), 0);
  for (const year of ['all', '2023', '2024', '2025', '2026']) {
    const votes = surveyChart({ year, metric: 'votes', all: true }).rows;
    for (let i = 1; i < votes.length; i++)
      assert.ok(total(votes[i - 1].name) >= total(votes[i].name));
    assert.deepEqual(
      votes.map((r) => r.name),
      surveyChart({ year, metric: 'percent', all: true }).rows.map(
        (r) => r.name,
      ),
    );
  }
  assert.equal(surveyChart({ all: true }).rows[0].name, 'Mario Kart');
});
