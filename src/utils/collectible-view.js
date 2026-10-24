export function nearestEquivalentAngle(current, desired) {
  return (
    current +
    Math.atan2(Math.sin(desired - current), Math.cos(desired - current))
  );
}

/** Perspective distance that preserves every vertex at the current viewing angle. */
export function fittedDistance(points, pitch, yaw, tangent, aspect, padding) {
  const cx = Math.cos(pitch),
    sx = Math.sin(pitch);
  const cy = Math.cos(yaw),
    sy = Math.sin(yaw);
  let distance = 0;
  for (const [x, y, z] of points) {
    const rx = cy * x + sy * z;
    const z1 = -sy * x + cy * z;
    const ry = cx * y - sx * z1;
    const rz = sx * y + cx * z1;
    distance = Math.max(
      distance,
      rz + Math.abs(rx) / (tangent * aspect * padding),
      rz + Math.abs(ry) / (tangent * padding),
    );
  }
  return distance;
}
