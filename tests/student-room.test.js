import assert from 'node:assert/strict';
import test from 'node:test';
import furniture from '../src/data/venue-furniture.json' with { type: 'json' };
import {
  studentRoomFurniture,
  isStudentRoomFurniture,
} from '../src/data/student-room.ts';

test('La sala de estudiantes conserva sus nueve mesas y treinta y cuatro sillas', () => {
  const original = furniture['principal-baja'].filter(isStudentRoomFurniture);
  assert.equal(original.filter((piece) => piece.width > 20).length, 9);
  assert.equal(original.filter((piece) => piece.width <= 20).length, 34);
  assert.equal(
    studentRoomFurniture.filter((piece) => piece.kind === 'desk').length,
    9,
  );
  assert.equal(
    studentRoomFurniture.filter((piece) => piece.kind === 'seat').length,
    34,
  );
});

test('Las mesas y sillas de la sala de estudiantes quedan separadas y dentro del recinto', () => {
  const angle = Math.PI / 6;
  const bounds = studentRoomFurniture.map((piece) => {
    const x =
      (piece.x - 124) * Math.cos(angle) - (piece.y - 85) * Math.sin(angle);
    const y =
      (piece.x - 124) * Math.sin(angle) + (piece.y - 85) * Math.cos(angle);
    return {
      left: x - piece.width / 2,
      right: x + piece.width / 2,
      top: y - piece.height / 2,
      bottom: y + piece.height / 2,
    };
  });
  for (const [index, box] of bounds.entries()) {
    assert.ok(
      box.left > 2 && box.right < 140 && box.top > 2 && box.bottom < 141,
    );
    for (const other of bounds.slice(index + 1))
      assert.ok(
        box.right < other.left ||
          other.right < box.left ||
          box.bottom < other.top ||
          other.bottom < box.top,
      );
  }
});
