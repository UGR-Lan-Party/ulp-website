import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
const fixtures = JSON.parse(
  readFileSync(
    new URL('../src/data/venue-aula-fixtures.json', import.meta.url),
    'utf8',
  ),
);

test('El mobiliario cabe en cada aula y las mesas no se superponen a sillas', () => {
  for (const [room, pieces] of Object.entries(fixtures)) {
    for (const piece of pieces) {
      assert.ok(piece.x >= 0 && piece.y >= 0);
      assert.ok(piece.width > 0 && piece.height > 0);
      assert.ok(piece.x + piece.width <= (room === 'inferiores' ? 1000 : 500));
      assert.ok(piece.y + piece.height <= 625);
    }
    for (const desk of pieces.filter((piece) => piece.kind === 'desk')) {
      for (const seat of pieces.filter((piece) => piece.kind === 'seat')) {
        const overlap =
          desk.x < seat.x + seat.width &&
          desk.x + desk.width > seat.x &&
          desk.y < seat.y + seat.height &&
          desk.y + desk.height > seat.y;
        assert.equal(overlap, false, `${room}: mesa y silla superpuestas`);
      }
    }
  }
});

test('La columna derecha de −1.2 está alineada con las mesas laterales', () => {
  const column = fixtures.inferiores.find(
    (piece) => piece.kind === 'column' && piece.x > 900,
  );
  const desks = fixtures.inferiores.filter(
    (piece) => piece.kind === 'desk' && piece.x > 900,
  );
  for (const desk of desks)
    assert.equal(column.x + column.width, desk.x + desk.width);
});

test('La mesa izquierda de la primera fila de A1 tiene cuatro sillas', () => {
  const seats = fixtures.a1.filter(
    (piece) => piece.kind === 'seat' && piece.y === 141 && piece.x < 151,
  );
  assert.equal(seats.length, 4);
});
