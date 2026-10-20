import assert from 'node:assert/strict';
import test from 'node:test';
import furniture from '../src/data/venue-furniture.json' with { type: 'json' };
import { auditoriumFurniture } from '../src/data/auditorium.ts';

test('El Salón de Actos mantiene todos los asientos en sus posiciones originales', () => {
  const original = furniture['principal-baja'].filter((piece) => piece.y > 330);
  const originalSeats = original.filter((piece) => piece.height < 12);
  const seats = auditoriumFurniture.filter((piece) => piece.height < 12);
  assert.equal(seats.length, 202);
  assert.deepEqual(
    seats.map(({ x, y }) => [x, y]),
    originalSeats.map(({ x, y }) => [x, y]),
  );
  assert.deepEqual(
    auditoriumFurniture.filter((piece) => piece.height >= 12),
    original.filter((piece) => piece.height >= 12),
  );
});
