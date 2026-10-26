import test from 'node:test';
import trace from '../src/data/venue-campus-trace.json' with { type: 'json' };
import {
  legacyAmphitheaterPath,
  campusCourtyardWaterPath,
  campusPerimeterPath,
  campusPerimeterVertices,
  campusPerimeterCornerRadii,
  getCampusPerimeterViewport,
} from '../src/data/venue-campus-landscape.ts';
import assert from 'node:assert/strict';
import {
  getModernCampusPoint,
  modernCampusPaths,
  modernCampusConnection,
  modernCampusLectureRooms,
  modernCampusColumns,
  modernCampusOutline,
  modernCampusSharedWall,
  modernPrincipalWing,
} from '../src/data/venue-campus-modern.ts';

test('the new building connects to the existing aulario at the traced corner', () => {
  const connection = getModernCampusPoint(527, 188);
  assert.deepEqual(connection, modernCampusConnection);
  const existingCorner = [
    ...trace.walls.matchAll(/[ML]([\d.]+) ([\d.]+)/g),
  ].some(
    (m) =>
      Math.abs(920 - Number(m[1]) - connection.x) < 0.01 &&
      Math.abs(700 - Number(m[2]) - connection.y) < 0.01,
  );
  assert.ok(
    existingCorner,
    'the extension must snap to an existing aulario vertex',
  );
  const outerCorner = getModernCampusPoint(762, 804);
  assert.ok(outerCorner.x > 500 && outerCorner.x < 600);
  assert.ok(outerCorner.y > 600 && outerCorner.y < 680);
});

test('the extension retains the annotated recesses and fits the map in every orientation', () => {
  const vertices = modernCampusPaths.third.match(/[MLHVZ]|-?\d+(?:\.\d+)?/g);
  let x = 0,
    y = 0,
    command = '';
  for (let i = 0; i < vertices.length;) {
    if (/^[MLHVZ]$/.test(vertices[i])) command = vertices[i++];
    if (command === 'Z') break;
    if (command === 'M' || command === 'L') {
      x = Number(vertices[i++]);
      y = Number(vertices[i++]);
    } else if (command === 'H') x = Number(vertices[i++]);
    else if (command === 'V') y = Number(vertices[i++]);
    const point = getModernCampusPoint(x, y);
    for (let orientation = 0; orientation < 4; orientation++) {
      const angle = (orientation * Math.PI) / 2;
      const px =
        460 +
        (point.x - 460) * Math.cos(angle) -
        (point.y - 350) * Math.sin(angle);
      const py =
        350 +
        (point.x - 460) * Math.sin(angle) +
        (point.y - 350) * Math.cos(angle);
      assert.ok(
        px > 0 && px < 920 && py > 0 && py < 700,
        `${x},${y} turn ${orientation}`,
      );
    }
  }
  assert.equal('aulario' in modernCampusPaths, false);
  assert.equal('principal' in modernCampusPaths, false);
});

function segments(path) {
  const tokens = path.match(/[MLHVZ]|-?\d+(?:\.\d+)?/g);
  const edges = [];
  let x = 0,
    y = 0,
    startX = 0,
    startY = 0,
    command = '';
  for (let i = 0; i < tokens.length;) {
    if (/^[MLHVZ]$/.test(tokens[i])) command = tokens[i++];
    const from = [x, y];
    if (command === 'M' || command === 'L') {
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
      if (command === 'M') {
        startX = x;
        startY = y;
        continue;
      }
    } else if (command === 'H') x = Number(tokens[i++]);
    else if (command === 'V') y = Number(tokens[i++]);
    else if (command === 'Z') {
      x = startX;
      y = startY;
    }
    edges.push([from, [x, y]]);
  }
  return edges;
}

test('all walls, recesses and gallery edges share perpendicular building axes', () => {
  for (const key of [
    'third',
    'gallery',
    'galleryEdge',
    'partitions',
    'stairs',
    'access',
    'gardenPath',
  ])
    for (const [[x1, y1], [x2, y2]] of segments(modernCampusPaths[key]))
      assert.ok(x1 === x2 || y1 === y2, `${key}: ${x1},${y1} to ${x2},${y2}`);
});

test('the green amphitheater perimeter uses vertices from the actual site outline', () => {
  const site = [...trace.site.matchAll(/[ML]([\d.]+) ([\d.]+)/g)];
  const sourcePoints = new Set(
    site.map(
      (m) =>
        `${(920 - Number(m[1])).toFixed(2)},${(700 - Number(m[2])).toFixed(2)}`,
    ),
  );
  for (const m of legacyAmphitheaterPath.matchAll(/[ML]([\d.]+) ([\d.]+)/g))
    assert.ok(
      sourcePoints.has(`${Number(m[1]).toFixed(2)},${Number(m[2]).toFixed(2)}`),
      m[0],
    );
});

test('partition and gallery wall endpoints meet another wall without gaps', () => {
  const wallNames = ['third', 'partitions', 'stairs', 'galleryEdge'];
  const walls = wallNames.flatMap((name) => segments(modernCampusPaths[name]));
  const contains = ([[x1, y1], [x2, y2]], [x, y]) =>
    x >= Math.min(x1, x2) &&
    x <= Math.max(x1, x2) &&
    y >= Math.min(y1, y2) &&
    y <= Math.max(y1, y2);
  for (const name of ['partitions', 'stairs', 'galleryEdge'])
    for (const edge of segments(modernCampusPaths[name]))
      for (const point of edge)
        assert.ok(
          walls.filter((wall) => contains(wall, point)).length >= 2,
          `${name}: dangling wall at ${point}`,
        );
});

test('the two projecting lecture rooms have matching seating proportions', () => {
  const [first, second] = modernCampusLectureRooms.slice(-2);
  assert.equal(first.x, second.x);
  assert.equal(first.width, second.width);
  assert.equal(first.height, second.height);
  assert.equal(first.rows, second.rows);
});

test('the new building only outlines the exposed end of its shared aulario facade', () => {
  assert.ok(!modernCampusOutline.endsWith('Z'));
  const end = segments(modernCampusOutline).at(-1)[1];
  const world = getModernCampusPoint(...end);
  assert.ok(Math.abs(world.x - modernCampusSharedWall.bottom.x) < 1e-8);
  assert.ok(Math.abs(world.y - modernCampusSharedWall.bottom.y) < 1e-8);
});

test('interior partitions meet the perimeter without repainting a length of facade', () => {
  const outline = segments(modernCampusOutline);
  const overlaps = ([[x1, y1], [x2, y2]], [[x3, y3], [x4, y4]]) => {
    if (x1 === x2 && x3 === x4 && x1 === x3)
      return (
        Math.min(Math.max(y1, y2), Math.max(y3, y4)) -
          Math.max(Math.min(y1, y2), Math.min(y3, y4)) >
        1e-6
      );
    if (y1 === y2 && y3 === y4 && y1 === y3)
      return (
        Math.min(Math.max(x1, x2), Math.max(x3, x4)) -
          Math.max(Math.min(x1, x2), Math.min(x3, x4)) >
        1e-6
      );
    return false;
  };
  for (const edge of segments(modernCampusPaths.partitions))
    assert.ok(
      !outline.some((wall) => overlaps(edge, wall)),
      `duplicate wall: ${JSON.stringify(edge)}`,
    );
});

test('the restored triangular wing joins the existing principal facade at both ends', () => {
  const existing = [...trace.walls.matchAll(/[ML]([\d.]+) ([\d.]+)/g)];
  for (const point of [modernPrincipalWing.east, modernPrincipalWing.west])
    assert.ok(
      existing.some(
        (m) =>
          Math.abs(920 - Number(m[1]) - point.x) < 0.01 &&
          Math.abs(700 - Number(m[2]) - point.y) < 0.01,
      ),
    );
  assert.ok(!modernPrincipalWing.outline.endsWith('Z'));
  assert.ok(modernPrincipalWing.fill.endsWith('Z'));
});

test('structural columns are unique and sit on walls or gallery supports', () => {
  const walls = ['third', 'partitions', 'galleryEdge'].flatMap((key) =>
    segments(modernCampusPaths[key]),
  );
  assert.equal(
    new Set(modernCampusColumns.map(({ x, y }) => `${x},${y}`)).size,
    modernCampusColumns.length,
  );
  for (const { x, y } of modernCampusColumns)
    assert.ok(
      walls.some(
        ([[x1, y1], [x2, y2]]) =>
          x >= Math.min(x1, x2) &&
          x <= Math.max(x1, x2) &&
          y >= Math.min(y1, y2) &&
          y <= Math.max(y1, y2),
      ),
      `floating column: ${x},${y}`,
    );
});

test('the enclosure has exactly three straight sides and three softened vertices', () => {
  assert.equal(campusPerimeterVertices.length, 3);
  assert.equal((campusPerimeterPath.match(/L/g) ?? []).length, 3);
  assert.equal((campusPerimeterPath.match(/A/g) ?? []).length, 3);
  assert.equal((campusPerimeterPath.match(/[CHVSQ]/g) ?? []).length, 0);
  assert.ok(campusPerimeterPath.endsWith('Z'));
});

test('the overview frame contains the three straight edges in every rotation', () => {
  for (let orientation = 0; orientation < 4; orientation++) {
    const [left, top, width, height] = getCampusPerimeterViewport(orientation);
    const angle = ((orientation - 2) * Math.PI) / 2;
    const points = campusPerimeterVertices.flatMap(
      (corner, index, vertices) => {
        const trim = campusPerimeterCornerRadii[index] / Math.tan(Math.PI / 6);
        return [vertices[(index + 2) % 3], vertices[(index + 1) % 3]].map(
          (neighbor) => {
            const length = Math.hypot(
              neighbor.x - corner.x,
              neighbor.y - corner.y,
            );
            return {
              x: corner.x + ((neighbor.x - corner.x) * trim) / length,
              y: corner.y + ((neighbor.y - corner.y) * trim) / length,
            };
          },
        );
      },
    );
    for (const point of points) {
      const x =
        460 +
        (point.x - 460) * Math.cos(angle) -
        (point.y - 350) * Math.sin(angle);
      const y =
        350 +
        (point.x - 460) * Math.sin(angle) +
        (point.y - 350) * Math.cos(angle);
      assert.ok(x >= left + 20 && x <= left + width - 20);
      assert.ok(y >= top + 20 && y <= top + height - 20);
    }
  }
});

test('the enclosure is equilateral and its right side is parallel to the third building', () => {
  const [left, right, bottom] = campusPerimeterVertices;
  const lengths = [
    [left, right],
    [right, bottom],
    [bottom, left],
  ].map(([a, b]) => Math.hypot(b.x - a.x, b.y - a.y));
  lengths.forEach((length) => assert.ok(Math.abs(length - lengths[0]) < 1e-8));
  const facadeTop = getModernCampusPoint(756, 180);
  const facadeBottom = getModernCampusPoint(756, 804);
  const cross =
    (bottom.x - right.x) * (facadeBottom.y - facadeTop.y) -
    (bottom.y - right.y) * (facadeBottom.x - facadeTop.x);
  assert.ok(Math.abs(cross) < 1e-8);
  assert.ok(campusPerimeterCornerRadii[2] > campusPerimeterCornerRadii[0]);
  assert.equal(campusPerimeterCornerRadii[0], campusPerimeterCornerRadii[1]);
});

test('the enclosure leaves clearance around both existing buildings and the new footprint', () => {
  const existing = [...trace.walls.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map(
    (m) => ({ x: 920 - Number(m[1]), y: 700 - Number(m[2]) }),
  );
  const modern = segments(modernCampusPaths.third)
    .flat()
    .map(([x, y]) => getModernCampusPoint(x, y));
  for (const point of [...existing, ...modern]) {
    campusPerimeterVertices.forEach((a, index, vertices) => {
      const b = vertices[(index + 1) % 3];
      const clearance =
        ((b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)) /
        Math.hypot(b.x - a.x, b.y - a.y);
      assert.ok(
        clearance >= 20,
        `perimeter too close to building at ${point.x},${point.y}`,
      );
    });
  }
});

test('the shared fountain retains the exact basin and circular detail vertices from the Legacy trace', () => {
  const original = [...trace.site.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map(
    (m) => [920 - Number(m[1]), 700 - Number(m[2])],
  );
  for (const [x, y] of segments(campusCourtyardWaterPath).flat()) {
    assert.ok(
      original.some(
        ([tx, ty]) => Math.abs(x - tx) < 0.01 && Math.abs(y - ty) < 0.01,
      ),
      `water vertex differs from original trace: ${x},${y}`,
    );
  }
});
