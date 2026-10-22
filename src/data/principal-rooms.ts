export type PrincipalRoomId = 'hall' | 'salon-actos';

export function isPrincipalRoomFurniture(
  piece: { x: number; y: number },
  room: PrincipalRoomId,
) {
  return room === 'hall' ? piece.x > 300 && piece.y > 300 : piece.y > 330;
}
