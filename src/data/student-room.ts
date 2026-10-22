type RoomFurniture = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  kind: 'desk' | 'seat';
};

const angle = Math.PI / 6;
const tables = [
  ...[35, 98].map((x) => ({ x, y: 27, width: 50, height: 20 })),
  ...[70, 99].flatMap((y) =>
    [23, 63, 103].map((x) => ({ x, y, width: 32, height: 9.5 })),
  ),
  { x: 23, y: 128, width: 21.7, height: 9.5 },
];
const chairs = [
  ...[35, 98].flatMap((x) =>
    [-1, 1].flatMap((side) =>
      [-16, 0, 16].map((offset) => ({ x: x + offset, y: 27 + side * 18 })),
    ),
  ),
  ...[70, 99].flatMap((y) =>
    [23, 63, 103].flatMap((x) => [
      { x: x - 8, y: y - 10 },
      { x: x + 8, y: y - 10 },
      { x, y: y + 10 },
    ]),
  ),
  ...[-1, 1].flatMap((side) =>
    [-6.5, 6.5].map((offset) => ({ x: 23 + offset, y: 128 + side * 10 })),
  ),
];

function place(
  piece: { x: number; y: number; width: number; height: number },
  kind: RoomFurniture['kind'],
): RoomFurniture {
  return {
    ...piece,
    x: 124 + piece.x * Math.cos(angle) + piece.y * Math.sin(angle),
    y: 85 - piece.x * Math.sin(angle) + piece.y * Math.cos(angle),
    angle: -30,
    kind,
  };
}

export const studentRoomFurniture = [
  ...tables.map((piece) => place(piece, 'desk')),
  ...chairs.map((piece) =>
    place({ ...piece, width: 10.5, height: 4.8 }, 'seat'),
  ),
];

export function isStudentRoomFurniture(piece: { x: number; y: number }) {
  return piece.x < 310 && piece.y < 210;
}

export const studentRoomEntrance = {
  x: 311,
  y: 135.8,
  angle: (Math.atan2(208 - 132, 197 - 317) * 180) / Math.PI,
  width: 30,
};
