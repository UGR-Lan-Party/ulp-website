import furniture from './venue-furniture.json' with { type: 'json' };
import { isPrincipalRoomFurniture } from './principal-rooms.ts';

const angle = (29 * Math.PI) / 180;
export const auditoriumFrame = { x: 514, y: 493, angle: -29 };

function toFrame(piece: { x: number; y: number }) {
  const x = piece.x - auditoriumFrame.x;
  const y = piece.y - auditoriumFrame.y;
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

export const auditoriumFurniture = furniture['principal-baja']
  .filter((piece) => isPrincipalRoomFurniture(piece, 'salon-actos'))
  .map((piece) => {
    if (piece.height >= 12) return piece;
    const stage = toFrame(piece).y > 120;
    return {
      ...piece,
      width: stage ? 14 : 13,
      height: stage ? 6.6 : 6.1,
      angle: stage ? -30 : -29,
    };
  });

const rows: { y: number; seats: { x: number; y: number }[] }[] = [];
const rearSeats = auditoriumFurniture
  .filter((piece) => piece.height < 12)
  .map(toFrame)
  .filter((piece) => piece.y < -35)
  .sort((a, b) => a.y - b.y);

for (const seat of rearSeats) {
  const row = rows.at(-1);
  if (!row || seat.y - row.y > 4) {
    rows.push({ y: seat.y, seats: [seat] });
  } else {
    row.seats.push(seat);
    row.y =
      row.seats.reduce((sum, piece) => sum + piece.y, 0) / row.seats.length;
  }
}

export const auditoriumTiers = rows.map((row) => {
  const blocks: { left: number; right: number }[] = [];
  for (const seat of row.seats.sort((a, b) => a.x - b.x)) {
    const block = blocks.at(-1);
    if (!block || seat.x - block.right > 22) {
      blocks.push({ left: seat.x, right: seat.x });
    } else {
      block.right = seat.x;
    }
  }
  return { y: row.y, blocks };
});
