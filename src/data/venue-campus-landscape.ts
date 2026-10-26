import {
  getModernCampusPoint,
  modernCampusRotation,
} from './venue-campus-modern.ts';

// The Legacy perimeter follows the original site trace, including its recessed entrances.
export const legacyAmphitheaterPath =
  'M519.33 412.48L529.55 412.35L529.81 407.56L538.22 407.56L538.99 407.3L544.43 406.91L549.21 405.88L549.99 407.82L552.45 417.39L552.83 417.91L560.47 415.71L560.59 415.45L564.22 414.29L570.17 411.57L578.06 406.91L581.94 404.07L586.85 399.93L590.47 396.31L594.23 392.04L596.55 388.94L600.18 383.5L603.02 378.2L605.35 372.77L607.94 364.75L609.36 357.5L610.01 350.26L609.75 340.43L608.71 333.44L607.29 327.62L603.67 317.92L600.95 312.62L595.52 304.34L590.6 298.52L584.91 293.09L577.02 287.14L570.81 283.52L563.18 280.02L554.26 277.18L552.32 274.98L551.93 274.2L547.66 275.11L542.49 277.95L538.22 279.51L534.08 280.41L528.78 280.93L513.51 280.8L513.12 281.06L513.12 288.3L512.87 288.56L518.56 289.47L518.82 289.73L518.82 299.56L518.56 299.81L493.85 299.68L493.46 300.33L493.46 310.03L493.59 310.42L494.63 310.55L494.63 384.15L493.59 384.41L493.59 393.72L493.33 393.98L482.6 393.98L482.6 404.97L482.34 405.75L520.11 405.75Z';

const gardenEdge = [
  [600, 323],
  [600, 655],
  [640, 655],
  [640, 790],
]
  .map(([x, y]) => getModernCampusPoint(x, y))
  .map(({ x, y }) => `L${x} ${y}`)
  .join('');
export const campusCourtyardWaterPath =
  'M483.63 440.8V419.07L496.05 418.81V407.95L496.31 406.79L518.82 406.91V409.37L517.78 414.93L515.71 420.5L512.61 425.8L511.05 427.87L507.43 431.62L502.39 435.37L496.57 438.35L493.72 439.38L490.75 440.16L489.84 440.16L489.58 440.42L486.61 440.8ZM489.71 414.8L488.03 414.55L487.13 413.64L486.74 412.74V412.09L487.25 410.92L487.9 410.28L488.81 409.89H489.71L490.75 410.28L491.39 410.92L491.91 412.22L491.39 413.77L490.62 414.55Z';
const courtyardBasin =
  'M483.63 440.8V419.07L496.05 418.81V407.95L496.31 406.79L518.82 406.91V409.37L517.78 414.93L515.71 420.5L512.61 425.8L511.05 427.87L507.43 431.62L502.39 435.37L496.57 438.35L493.72 439.38L490.75 440.16L489.84 440.16L489.58 440.42L486.61 440.8Z';
export const modernCourtyardPath = `M494.63 310.55L493.59 310.42L493.46 310.03V300.33L493.85 299.68L518.56 299.81L518.82 299.56V289.73L518.56 289.47L512.87 288.56L513.12 288.3V281.06L513.51 280.8L528.78 280.93L534.08 280.41L538.22 279.51L542.49 277.95L547.66 275.11L551.8 271.75L555.03 268.51L556.46 266.7L559.43 262.04L562.02 255.45H580.39L580.64 256.22L580.39 256.74H594L588.19 275.5${gardenEdge}L460.8 574.9L487.5 528.4L471.9 507.8L485.5 477.9L482.99 442.1L482.34 405.75L482.6 404.97V393.98H493.33L493.59 393.72V384.41L494.63 384.15Z`;
export const modernCourtyardPaving = {
  promenade: [
    'M495.66 310.55H526.96V384.15H495.66Z',
    'M505.23 300.85H519.33V310.29H505.23Z',
    'M505.23 384.41H519.2V393.98H505.23Z',
    'M483.5 394.89H518.69L518.82 405.1L517.52 405.36L483.76 405.23Z',
    'M483.76 406.27H495.53V418.3H483.76Z',
    courtyardBasin,
  ].join(''),
};

const perimeterHeading = ((modernCampusRotation - 30) * Math.PI) / 180;
const perimeterOrigin = { x: 31, y: 122.5 };
const perimeterSide = 902;
export const campusPerimeterCornerRadii = [48, 48, 180];
const legacyPerimeterScale = 1 - 28 / ((perimeterSide * Math.sqrt(3)) / 2);
export const legacyCampusPerimeterTransform = `translate(${perimeterOrigin.x} ${perimeterOrigin.y}) scale(${legacyPerimeterScale}) translate(${-perimeterOrigin.x} ${-perimeterOrigin.y})`;

export const campusPerimeterVertices = [
  perimeterOrigin,
  ...[0, Math.PI / 3].map((angle) => ({
    x: perimeterOrigin.x + perimeterSide * Math.cos(perimeterHeading + angle),
    y: perimeterOrigin.y + perimeterSide * Math.sin(perimeterHeading + angle),
  })),
];
const corners = campusPerimeterVertices.map((corner, index, vertices) => {
  const radius = campusPerimeterCornerRadii[index];
  const cornerTrim = radius / Math.tan(Math.PI / 6);
  const inset = (neighbor: { x: number; y: number }) => {
    const length = Math.hypot(neighbor.x - corner.x, neighbor.y - corner.y);
    return {
      x: corner.x + ((neighbor.x - corner.x) * cornerTrim) / length,
      y: corner.y + ((neighbor.y - corner.y) * cornerTrim) / length,
    };
  };
  return {
    radius,
    entry: inset(vertices[(index + 2) % 3]),
    exit: inset(vertices[(index + 1) % 3]),
  };
});
const point = ({ x, y }: { x: number; y: number }) => `${x} ${y}`;
export const campusPerimeterPath =
  `M${point(corners[0].exit)}` +
  [1, 2, 0]
    .map((index) => {
      const { entry, exit, radius } = corners[index];
      return `L${point(entry)}A${radius} ${radius} 0 0 1 ${point(exit)}`;
    })
    .join('') +
  'Z';

// Include the circular arcs' extrema, rather than the trimmed-away triangle tips.
const perimeterFramePoints = corners.flatMap(
  ({ entry, exit, radius }, index) => {
    const corner = campusPerimeterVertices[index];
    const center = {
      x: corner.x + ((entry.x + exit.x - 2 * corner.x) * 2) / 3,
      y: corner.y + ((entry.y + exit.y - 2 * corner.y) * 2) / 3,
    };
    const start = Math.atan2(entry.y - center.y, entry.x - center.x);
    const extrema = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
      .filter(
        (angle) =>
          (angle - start + 2 * Math.PI) % (2 * Math.PI) <=
          (2 * Math.PI) / 3 + 1e-8,
      )
      .map((angle) => ({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      }));
    return [entry, exit, ...extrema];
  },
);

export function getCampusPerimeterViewport(orientation: number) {
  const angle = ((orientation - 2) * Math.PI) / 2;
  const vertices = perimeterFramePoints.map(({ x, y }) => ({
    x: 460 + (x - 460) * Math.cos(angle) - (y - 350) * Math.sin(angle),
    y: 350 + (x - 460) * Math.sin(angle) + (y - 350) * Math.cos(angle),
  }));
  const left = Math.min(0, ...vertices.map(({ x }) => x - 24));
  const top = Math.min(-5, ...vertices.map(({ y }) => y - 24));
  const right = Math.max(920, ...vertices.map(({ x }) => x + 24));
  const bottom = Math.max(705, ...vertices.map(({ y }) => y + 24));
  return [left, top, right - left, bottom - top];
}
