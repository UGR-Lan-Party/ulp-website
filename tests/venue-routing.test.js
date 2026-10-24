import test from 'node:test';
import assert from 'node:assert/strict';
import {
  routeNodes,
  routeEdges,
  routeLocations,
  findVenueRoute,
  getVenueRoutePath,
} from '../src/utils/venue-routing.js';
import { campusPoint } from '../src/data/venue-map.ts';
test('Graph nodes are finite, unique, and every destination is connected', () => {
  const nodes = new Map(routeNodes.map((n) => [n.id, n]));
  assert.equal(nodes.size, routeNodes.length);
  for (const n of nodes.values())
    assert.ok(Number.isFinite(n.x) && Number.isFinite(n.y));
  for (const edge of routeEdges) {
    assert.ok(nodes.has(edge.from));
    assert.ok(nodes.has(edge.to));
    assert.notEqual(edge.kind, 'lift');
  }
  for (const location of routeLocations) {
    assert.ok(nodes.has(location.node));
    if (location.id !== 'hall')
      assert.ok(findVenueRoute('hall', location.id), location.id);
  }
});
test('All floor changes use stairs, in either direction and both buildings', () => {
  for (const [a, b] of [
    ['hall', 'estudiantes'],
    ['estudiantes', 'hall'],
    ['aulario-0.1', 'aulario-1.1'],
    ['aulario-1.8', 'aulario-0.8'],
  ]) {
    const route = findVenueRoute(a, b);
    assert.ok(route);
    assert.ok(route.segments.some((s) => s.transition === 'stairs'));
    assert.ok(route.segments.every((s) => s.transition !== 'lift'));
  }
});
test('The exterior route follows the lateral path without a separate passage view', () => {
  for (const [a, b] of [
    ['hall', 'bancos-rojos'],
    ['bancos-rojos', 'hall'],
  ]) {
    const route = findVenueRoute(a, b);
    assert.ok(route.segments.every((s) => s.plan !== 'pasillo-exterior'));
    const points = route.overviewPoints;
    assert.ok(
      points.some(
        (p) =>
          p.x === campusPoint(896, 580).x && p.y === campusPoint(896, 580).y,
      ),
    );
  }
});
test('Rounded paths preserve endpoints, trim short bends and reject non-finite points', () => {
  const d = getVenueRoutePath(
    [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ],
    20,
  );
  assert.ok(d.startsWith('M0 0'));
  assert.ok(d.endsWith('L10 10'));
  assert.ok(d.includes('Q10 0'));
  assert.equal(getVenueRoutePath([]), '');
  assert.equal(getVenueRoutePath([{ x: NaN, y: 0 }]), '');
  assert.ok(
    !getVenueRoutePath([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]).includes('NaN'),
  );
});
test('Invalid destinations never generate a route', () => {
  for (const args of [
    ['hall', 'hall'],
    ['<script>', 'hall'],
    ['hall', 'unknown'],
  ])
    assert.equal(findVenueRoute(...args), null);
});

test('Same-floor trips stay on their floor and never use the disabled Grados exit', () => {
  for (const [origin, destination] of [
    ['hall', 'grados'],
    ['aulario-1.1', 'aulario-1.8'],
    ['estudiantes', 'cafeteria'],
  ]) {
    const route = findVenueRoute(origin, destination);
    assert.ok(route);
    assert.equal(route.segments.length, 1);
  }
  for (const destination of routeLocations.filter(
    (item) => item.id !== 'grados',
  )) {
    const route = findVenueRoute('grados', destination.id);
    assert.ok(route);
    assert.ok(
      route.segments.every((segment) =>
        segment.points.every(
          (point) =>
            segment.plan !== 'principal-0' ||
            Math.hypot(
              point.x - (185 + 218 * 0.55),
              point.y - (110 + 850 * 0.55),
            ) > 1,
        ),
      ),
    );
  }
});
