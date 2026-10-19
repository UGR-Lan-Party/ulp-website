type Point = { x: number; y: number };

export function getVenueLeaderPath(
  start: Point,
  end: Point,
  verticalFirst = false,
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const origin = `M${start.x} ${start.y}`;
  if (Math.abs(dx) < 0.01 || Math.abs(dy) < 0.01)
    return `${origin}L${end.x} ${end.y}`;
  const radius = Math.min(8, Math.abs(dx) / 2, Math.abs(dy) / 2);
  const rx = radius * Math.sign(dx);
  const ry = radius * Math.sign(dy);
  return verticalFirst
    ? `${origin}L${start.x} ${end.y - ry}Q${start.x} ${end.y} ${start.x + rx} ${end.y}L${end.x} ${end.y}`
    : `${origin}L${end.x - rx} ${start.y}Q${end.x} ${start.y} ${end.x} ${start.y + ry}L${end.x} ${end.y}`;
}
