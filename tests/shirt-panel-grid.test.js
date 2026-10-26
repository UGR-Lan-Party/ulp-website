import test from 'node:test';
import assert from 'node:assert/strict';
import { shirtPanelGrid } from '../src/utils/shirt-panel-grid.js';

test('La malla de camiseta usa triángulos locales, sin diagonales largas desde el cuello', () => {
  const outline = [
    [-0.26, 0.98],
    [-0.6, 1],
    [-1.2, 0.63],
    [-1.04, 0.18],
    [-0.71, 0.32],
    [-0.73, -1.02],
    [0.73, -1.02],
    [0.71, 0.32],
    [1.04, 0.18],
    [1.2, 0.63],
    [0.6, 1],
    [0.26, 0.98],
    [0.17, 0.8],
    [0, 0.75],
    [-0.17, 0.8],
  ];
  const { points, triangles } = shirtPanelGrid(outline);
  assert(points.length > 900);
  assert(triangles.length > 1500);
  const edges = new Map();
  for (const [a, b, c] of triangles) {
    for (const [i, j] of [
      [a, b],
      [b, c],
      [c, a],
    ]) {
      const distance = Math.hypot(
        points[i][0] - points[j][0],
        points[i][1] - points[j][1],
      );
      assert(
        distance < 0.08,
        'Ningún triángulo debe atravesar un panel completo de tela',
      );
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      edges.set(key, (edges.get(key) || 0) + 1);
    }
    const area =
      (points[b][0] - points[a][0]) * (points[c][1] - points[a][1]) -
      (points[b][1] - points[a][1]) * (points[c][0] - points[a][0]);
    assert(area > 1e-10);
  }
  assert(
    [...edges.values()].every((count) => count <= 2),
    'La superficie debe ser una malla sin caras superpuestas',
  );
});
