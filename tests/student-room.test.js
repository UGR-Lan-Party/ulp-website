import assert from 'node:assert/strict';
import test from 'node:test';
import {
  studentRoomFurniture,
  studentRoomTables,
  studentRoomBoards,
  studentRoomLocalFurniture,
} from '../src/data/student-room.ts';

test('La sala de estudiantes conserva sus nueve mesas y treinta y dos sillas', () => {
  assert.equal(
    studentRoomFurniture.filter((piece) => piece.kind === 'desk').length,
    9,
  );
  assert.equal(
    studentRoomFurniture.filter((piece) => piece.kind === 'seat').length,
    32,
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
        box.right <= other.left + 0.0001 ||
          other.right <= box.left + 0.0001 ||
          box.bottom + 1 < other.top ||
          other.bottom + 1 < box.top,
      );
  }
});

test('Cada par de sillas enfrentadas comparte un tablero centrado dentro de su mesa', () => {
  const chairs = studentRoomLocalFurniture.filter(
    (piece) => piece.kind === 'seat',
  );
  assert.equal(studentRoomBoards.length, 16);
  assert.equal(chairs.length, studentRoomBoards.length * 2);
  for (const table of studentRoomTables) {
    const boards = studentRoomBoards.filter(
      (board) => board.table === table.id,
    );
    assert.equal(boards.length, table.pairs.length);
    for (const board of boards) {
      for (const side of [-1, 1]) {
        assert.equal(
          chairs.filter(
            (chair) =>
              chair.x === board.x &&
              chair.y === board.y + side * table.chairOffset,
          ).length,
          1,
        );
      }
      assert.ok(Math.abs(board.x - table.x) + board.size / 2 < table.width / 2);
      assert.ok(board.size < table.height);
      for (const other of boards) {
        if (board === other) continue;
        assert.ok(Math.abs(board.x - other.x) > (board.size + other.size) / 2);
      }
    }
  }
});
