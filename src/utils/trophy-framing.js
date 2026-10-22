import { Box3, Sphere, Vector3 } from 'three';

// Measure actual geometry rather than the empty corners of its bounding box.
export function measureTrophyBounds(object) {
  object.updateWorldMatrix(true, true);
  const center = new Box3().setFromObject(object).getCenter(new Vector3());
  const vertex = new Vector3();
  let radiusSquared = 0;
  object.traverse((child) => {
    if (!child.isMesh || !child.geometry.attributes.position) return;
    const positions = child.geometry.attributes.position;
    for (let index = 0; index < positions.count; index++) {
      vertex
        .fromBufferAttribute(positions, index)
        .applyMatrix4(child.matrixWorld);
      radiusSquared = Math.max(radiusSquared, vertex.distanceToSquared(center));
    }
  });
  return new Sphere(center, Math.sqrt(radiusSquared) || 1);
}

// Fit the entire bounding sphere, including a screen-space margin, in both axes.
// A sphere remains valid while the model spins or the viewer orbits it.
export function trophyFitDistance(radius, verticalFov, aspect) {
  const safeRadius = Number.isFinite(radius) && radius > 0 ? radius : 1;
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const halfHeight = Math.tan((verticalFov * Math.PI) / 360);
  const limitingHalfAngle = Math.atan(
    Math.min(halfHeight, halfHeight * safeAspect) * 0.94,
  );
  return safeRadius / Math.sin(limitingHalfAngle);
}
