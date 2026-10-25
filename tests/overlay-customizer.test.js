import test from 'node:test';
import assert from 'node:assert/strict';
import {
  overlayText,
  overlayScore,
  overlaySettings,
} from '../src/utils/overlay-customizer.js';
test('Los nombres conservan acentos y texto literal, limitando longitud y caracteres de control', () => {
  assert.equal(
    overlayText('  Poke\u0301mon\n\u202e equipo  '),
    'Pokémon equipo',
  );
  assert.equal(overlayText('😀'.repeat(60)), '😀'.repeat(36));
  assert.equal(
    overlayText('<img src=x onerror=alert(1)>'),
    '<img src=x onerror=alert(1)>',
  );
  for (const value of [null, undefined, {}, [], 12])
    assert.equal(overlayText(value, 'Equipo'), 'Equipo');
});
test('Los marcadores y modos admiten solo los rangos y diseños previstos', () => {
  for (const [value, expected] of [
    ['', 0],
    ['-9', 0],
    ['18.9', 18],
    ['10000', 99],
    ['Infinity', 0],
    ['bad', 0],
    [{}, 0],
  ])
    assert.equal(overlayScore(value), expected);
  assert.equal(
    overlaySettings({ mode: '<script>', scoreA: '9999' }).mode,
    'both',
  );
  assert.equal(overlaySettings({ mode: 'caption' }).mode, 'caption');
  assert.equal(overlaySettings(null).teamA, 'Equipo A');
  assert.equal(
    overlaySettings({ player: '', caption: '' }).player,
    'UGR LAN Party',
  );
});
