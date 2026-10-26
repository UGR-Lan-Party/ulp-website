type RoomFurniture = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  kind: 'desk' | 'seat';
};

export const studentRoomTables = [
  ...[48.5, 93.5].map((x, index) => ({
    id: `large-${index}`,
    x,
    y: 22,
    width: 50,
    height: 20,
    pairs: [-16, 0, 16],
    chairOffset: 18,
  })),
  ...[61, 99].flatMap((y, row) =>
    [42.2, 71, 99.8].map((x, column) => ({
      id: `row-${row}-${column}`,
      x,
      y,
      width: 32,
      height: 14,
      pairs: (row + column) % 2 === 0 ? [-8, 8] : [0],
      chairOffset: 12,
    })),
  ),
  {
    id: 'end',
    x: 42.2,
    y: 128,
    width: 26,
    height: 12,
    pairs: [0],
    chairOffset: 10,
  },
].map((table) => ({
  ...table,
  width: table.width * 0.9,
  height: table.height * 0.9,
  pairs: table.pairs.map((x) => x * 0.9),
  chairOffset: table.chairOffset * 0.9,
}));

export const studentRoomLocalFurniture: RoomFurniture[] =
  studentRoomTables.flatMap((table) => [
    {
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
      angle: 0,
      kind: 'desk',
    },
    ...table.pairs.flatMap((offset) =>
      [-1, 1].map((side) => ({
        x: table.x + offset,
        y: table.y + side * table.chairOffset,
        width: 10.5 * 0.9,
        height: 4.8 * 0.9,
        angle: 0,
        kind: 'seat' as const,
      })),
    ),
  ]);

export const studentRoomBoards = studentRoomTables.flatMap((table) =>
  table.pairs.map((offset, index) => ({
    id: `${table.id}-${index}`,
    table: table.id,
    x: table.x + offset,
    y: table.y,
    size: Math.min(table.height - 1.8, table.width / table.pairs.length - 1.8),
  })),
);

const angle = Math.PI / 6;
export const studentRoomFurniture = studentRoomLocalFurniture.map((piece) => ({
  ...piece,
  x: 124 + piece.x * Math.cos(angle) + piece.y * Math.sin(angle),
  y: 85 - piece.x * Math.sin(angle) + piece.y * Math.cos(angle),
  angle: -30,
}));

export function isStudentRoomFurniture(piece: { x: number; y: number }) {
  return piece.x < 310 && piece.y < 210;
}

export const studentRoomEntrance = {
  x: 311,
  y: 135.8,
  angle: (Math.atan2(208 - 132, 197 - 317) * 180) / Math.PI,
  width: 30,
};
