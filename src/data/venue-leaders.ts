type Point = { x: number; y: number };

export function getVenueLeaderPath(
  start: Point,
  end: Point,
  verticalFirst = false,
  via?: Point,
) {
  if (via) {
    const corner =
      Math.abs(via.x - end.x) < 0.01
        ? { x: start.x, y: via.y }
        : { x: via.x, y: start.y };
    const points = [start, corner, via, end].filter(
      (point, index, all) =>
        !index ||
        Math.hypot(point.x - all[index - 1].x, point.y - all[index - 1].y) >
          0.01,
    );
    let path = `M${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const before = points[i - 1],
        point = points[i],
        after = points[i + 1];
      const a = Math.hypot(point.x - before.x, point.y - before.y),
        b = Math.hypot(after.x - point.x, after.y - point.y),
        r = Math.min(8, a / 2, b / 2);
      const x1 = point.x - ((point.x - before.x) / a) * r,
        y1 = point.y - ((point.y - before.y) / a) * r,
        x2 = point.x + ((after.x - point.x) / b) * r,
        y2 = point.y + ((after.y - point.y) / b) * r;
      path += `L${x1} ${y1}Q${point.x} ${point.y} ${x2} ${y2}`;
    }
    return path + `L${end.x} ${end.y}`;
  }
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
