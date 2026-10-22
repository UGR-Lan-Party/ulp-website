import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findVenueRoute,
  getVenueRoutePath,
  unavailableRouteDoors,
  routeNodes,
} from '../src/utils/venue-routing.js';
test('Hall to patio is a straight route and collinear bends disappear from its SVG', () => {
  const route = findVenueRoute('hall', 'patio');
  const points = route.segments[0].points;
  assert.ok(points.every((p) => p.y === points[0].y));
  assert.ok(!getVenueRoutePath(points).includes('Q'));
  assert.equal(route.segments.length, 1);
});
test('Aulario corridor routes never reverse direction to reach stairs or the lift junction', () => {
  for (const [a, b] of [
    ['aulario-1.8', 'aulario-1.1'],
    ['aulario-1.1', 'aulario-1.8'],
  ]) {
    const points = findVenueRoute(a, b).segments[0].points;
    const corridor = points.filter(
      (p) => Math.abs(p.y - (350 + (28 - 90) * 0.46)) < 0.001,
    );
    const direction = Math.sign(corridor.at(-1).x - corridor[0].x);
    for (let i = 1; i < corridor.length; i++)
      assert.ok((corridor[i].x - corridor[i - 1].x) * direction >= 0);
  }
});
test('Routes from Grados use its main door and leave via the patio, never the closed auxiliary exit', () => {
  const route = findVenueRoute('grados', 'bancos-rojos');
  const first = route.segments[0];
  assert.deepEqual(first.points[0], {
    x: 185 + 276 * 0.55,
    y: 110 + 679 * 0.55,
  });
  assert.deepEqual(first.points.at(-1), {
    x: 185 + 156 * 0.55,
    y: 110 + 365 * 0.55,
  });
  for (const door of unavailableRouteDoors)
    assert.ok(
      !routeNodes.some(
        (n) =>
          n.plan === door.plan && Math.hypot(n.x - door.x, n.y - door.y) < 1,
      ),
    );
});
