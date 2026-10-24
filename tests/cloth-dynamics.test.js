import test from 'node:test';
import assert from 'node:assert/strict';
import { ClothDynamics } from '../src/utils/cloth-dynamics.js';

function patch() {
  const points = [],
    edges = [],
    pins = [],
    width = 12,
    height = 14;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      points.push((x - width / 2) * 0.08, 1 - y * 0.08, 0.02 * Math.sin(x));
      if (y === 0) pins.push(i);
      if (x) edges.push(i, i - 1);
      if (y) edges.push(i, i - width);
      if (x && y) edges.push(i, i - width - 1);
    }
  return new ClothDynamics(new Float32Array(points), edges, pins);
}
const deviation = (cloth) =>
  Math.max(...cloth.positions.map((p, i) => Math.abs(p - cloth.rest[i])));

test('La tela permanece en reposo sin fuerzas y mantiene las sujeciones al girar', () => {
  const cloth = patch();
  for (let i = 0; i < 120; i++) cloth.step(1 / 60, { gravity: 0 });
  assert(deviation(cloth) < 1e-5);
  for (let i = 0; i < 24; i++)
    cloth.step(1 / 60, { spin: 4, acceleration: 30 });
  assert(
    deviation(cloth) > 0.005,
    'El giro debe deformar la tela, no solo rotar la malla',
  );
  for (let p = 0; p < cloth.weights.length; p++)
    if (!cloth.weights[p])
      for (let axis = 0; axis < 3; axis++)
        assert.equal(cloth.positions[p * 3 + axis], cloth.rest[p * 3 + axis]);
});
test('Los impulsos se amortiguan sin estirar la tela fuera de sus límites', () => {
  const cloth = patch();
  for (let i = 0; i < 30; i++)
    cloth.step(1 / 60, { spin: 8, acceleration: -45, gravity: 0 });
  const disturbed = deviation(cloth);
  assert(disturbed > 0.01);
  for (let i = 0; i < 480; i++) cloth.step(1 / 60, { gravity: 0 });
  assert(
    deviation(cloth) < disturbed * 0.2,
    'La tela debe volver a estabilizarse',
  );
  for (let i = 0; i < 180; i++)
    cloth.step(i % 2 ? 5 : 1 / 240, { spin: 1000, acceleration: 1000 });
  assert([...cloth.positions].every(Number.isFinite));
  for (let i = 0; i < cloth.positions.length; i += 3)
    assert(
      Math.hypot(
        ...[0, 1, 2].map(
          (axis) => cloth.positions[i + axis] - cloth.rest[i + axis],
        ),
      ) <= 0.22001,
    );
  cloth.reset();
  assert.deepEqual(cloth.positions, cloth.rest);
  assert.deepEqual(cloth.previous, cloth.rest);
});
