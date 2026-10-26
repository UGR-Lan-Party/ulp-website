import { ShapeUtils, Vector2 } from 'three';

function contains(polygon, x, y) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i],
      b = polygon[j];
    const cross = (x - a[0]) * (b[1] - a[1]) - (y - a[1]) * (b[0] - a[0]);
    if (
      Math.abs(cross) < 1e-9 &&
      x >= Math.min(a[0], b[0]) - 1e-9 &&
      x <= Math.max(a[0], b[0]) + 1e-9 &&
      y >= Math.min(a[1], b[1]) - 1e-9 &&
      y <= Math.max(a[1], b[1]) + 1e-9
    )
      return true;
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}

function clip(polygon, axis, bound, greater) {
  if (!polygon.length) return [];
  const result = [];
  let previous = polygon.at(-1),
    wasInside = greater ? previous[axis] >= bound : previous[axis] <= bound;
  for (const current of polygon) {
    const isInside = greater ? current[axis] >= bound : current[axis] <= bound;
    if (isInside !== wasInside) {
      const t = (bound - previous[axis]) / (current[axis] - previous[axis]);
      result.push([
        previous[0] + t * (current[0] - previous[0]),
        previous[1] + t * (current[1] - previous[1]),
      ]);
    }
    if (isInside) result.push(current);
    previous = current;
    wasInside = isInside;
  }
  return result;
}

/** A uniform cloth lattice, clipped to the garment rather than fanned from its neckline. */
export function shirtPanelGrid(contour, columns = 44, rows = 40) {
  const polygon = contour.map((p) => [p[0], p[1]]);
  if (
    Math.hypot(
      polygon[0][0] - polygon.at(-1)[0],
      polygon[0][1] - polygon.at(-1)[1],
    ) < 1e-8
  )
    polygon.pop();
  const minX = Math.min(...polygon.map((p) => p[0])),
    maxX = Math.max(...polygon.map((p) => p[0]));
  const minY = Math.min(...polygon.map((p) => p[1])),
    maxY = Math.max(...polygon.map((p) => p[1]));
  const points = [],
    triangles = [],
    cache = new Map();
  const vertex = (p) => {
    const key = `${Math.round(p[0] * 1e7)}:${Math.round(p[1] * 1e7)}`;
    if (!cache.has(key)) {
      cache.set(key, points.length);
      points.push(p);
    }
    return cache.get(key);
  };
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < columns; col++) {
      const left = minX + ((maxX - minX) * col) / columns,
        right = minX + ((maxX - minX) * (col + 1)) / columns;
      const bottom = minY + ((maxY - minY) * row) / rows,
        top = minY + ((maxY - minY) * (row + 1)) / rows;
      const corners = [
        [left, bottom],
        [right, bottom],
        [right, top],
        [left, top],
      ];
      if (corners.every((p) => contains(polygon, ...p))) {
        const [a, b, c, d] = corners.map(vertex);
        if ((row + col) % 2) triangles.push([a, b, d], [b, c, d]);
        else triangles.push([a, b, c], [a, c, d]);
        continue;
      }
      let clipped = clip(
        clip(
          clip(clip(polygon, 0, left, true), 0, right, false),
          1,
          bottom,
          true,
        ),
        1,
        top,
        false,
      );
      clipped = clipped.filter((p, i) => {
        const next = clipped[(i + 1) % clipped.length];
        return Math.hypot(p[0] - next[0], p[1] - next[1]) > 1e-8;
      });
      if (clipped.length < 3) continue;
      for (const face of ShapeUtils.triangulateShape(
        clipped.map((p) => new Vector2(...p)),
        [],
      )) {
        const [a, b, c] = face.map((i) => clipped[i]);
        const area =
          (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        if (
          Math.abs(area) < 1e-10 ||
          !contains(polygon, (a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3)
        )
          continue;
        triangles.push((area > 0 ? [a, b, c] : [a, c, b]).map(vertex));
      }
    }
  return { points, triangles };
}
