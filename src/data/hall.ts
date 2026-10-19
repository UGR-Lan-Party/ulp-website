const rows = [
  {
    start: { x: 350, y: 416 },
    end: { x: 473, y: 670 },
    positions: [0.14, 0.31, 0.48, 0.65, 0.82],
    offset: -12,
    chairs: 16,
  },
  {
    start: { x: 559, y: 308 },
    end: { x: 692, y: 546 },
    positions: [0.1, 0.29, 0.48, 0.67, 0.86],
    offset: 14,
    chairs: -16,
  },
  {
    start: { x: 473, y: 670 },
    end: { x: 692, y: 546 },
    positions: [0.18, 0.38, 0.58, 0.78],
    offset: -12,
    chairs: 16,
  },
];

export const hallFurniture = rows.flatMap((row) => {
  const dx = row.end.x - row.start.x;
  const dy = row.end.y - row.start.y;
  const length = Math.hypot(dx, dy);
  const tx = dx / length;
  const ty = dy / length;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return row.positions.flatMap((t) => {
    const x = row.start.x + dx * t - ty * row.offset;
    const y = row.start.y + dy * t + tx * row.offset;
    return [
      { x, y, width: 44.5, height: 14.5, angle, kind: 'desk' as const },
      ...[-9, 9].map((offset) => ({
        x: x + tx * offset - ty * row.chairs,
        y: y + ty * offset + tx * row.chairs,
        width: 12,
        height: 5.8,
        angle,
        kind: 'seat' as const,
      })),
    ];
  });
});
