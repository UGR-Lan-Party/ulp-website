import assert from 'node:assert/strict';
import test from 'node:test';
import { getCarouselOrder } from '../src/utils/carousel-order.js';

test('El orden aleatorio mantiene la portada y todas las fotos exactamente una vez', () => {
  for (const size of [0, 1, 2, 7, 434, 500]) {
    const indices = getCarouselOrder(size, 'sesion:album');
    assert.equal(indices.length, size);
    assert.equal(new Set(indices).size, size);
    assert.deepEqual(
      [...indices].sort((a, b) => a - b),
      Array.from({ length: size }, (_, index) => index),
    );
    if (size) assert.equal(indices[0], 0);
  }
});

test('Una semilla conserva el recorrido y otras sesiones o álbumes lo cambian', () => {
  const order = getCarouselOrder(40, 'visita-1:album-a');
  assert.deepEqual(getCarouselOrder(40, 'visita-1:album-a'), order);
  assert.notDeepEqual(getCarouselOrder(40, 'visita-2:album-a'), order);
  assert.notDeepEqual(getCarouselOrder(40, 'visita-1:album-b'), order);
});
