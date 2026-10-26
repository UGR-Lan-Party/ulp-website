import * as THREE from 'three';
import { ClothDynamics } from '../../utils/cloth-dynamics.js';
import { shirtPanelGrid } from '../../utils/shirt-panel-grid.js';

export interface ShirtDesign {
  year: number;
  color: string;
  front: string;
  back: string;
  printWidth: number;
  printHeight: number;
}

function clothTopology() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.22, 0.98);
  shape.quadraticCurveTo(-0.43, 0.98, -0.64, 0.92);
  shape.lineTo(-1.2, 0.63);
  shape.lineTo(-1.04, 0.18);
  shape.lineTo(-0.71, 0.32);
  shape.lineTo(-0.73, -1.02);
  shape.quadraticCurveTo(0, -1.08, 0.73, -1.02);
  shape.lineTo(0.71, 0.32);
  shape.lineTo(1.04, 0.18);
  shape.lineTo(1.2, 0.63);
  shape.lineTo(0.64, 0.92);
  shape.quadraticCurveTo(0.43, 0.98, 0.22, 0.98);
  shape.bezierCurveTo(0.19, 0.88, -0.19, 0.88, -0.22, 0.98);
  const { points, triangles } = shirtPanelGrid(
    shape.getPoints(12).map((point) => [point.x, point.y]),
  );
  const count = points.length,
    positions: number[] = [],
    uv: number[] = [],
    frontIndex: number[] = [],
    backIndex: number[] = [],
    sideIndex: number[] = [];
  for (const side of [1, -1])
    for (const [x, y] of points) {
      const torso = Math.max(
        0,
        1 - Math.pow(Math.min(Math.abs(x) / 0.76, 1), 2),
      );
      const depth =
        0.035 +
        0.09 * torso +
        0.012 * Math.sin(x * 22 + y * 4) * Math.max(0, 0.9 - y);
      positions.push(x, y, side * depth);
      uv.push(
        side === 1 ? (x + 1.25) / 2.5 : 1 - (x + 1.25) / 2.5,
        (y + 1.1) / 2.2,
      );
    }
  const edgeCounts = new Map<string, { a: number; b: number; count: number }>();
  const springs: number[] = [];
  for (const [a, b, c] of triangles) {
    frontIndex.push(a, b, c);
    backIndex.push(c + count, b + count, a + count);
    for (const [x, y] of [
      [a, b],
      [b, c],
      [c, a],
    ]) {
      const key = x < y ? `${x}:${y}` : `${y}:${x}`;
      const edge = edgeCounts.get(key);
      if (edge) edge.count++;
      else edgeCounts.set(key, { a: x, b: y, count: 1 });
    }
  }
  for (const { a, b, count: uses } of edgeCounts.values()) {
    springs.push(a, b, a + count, b + count);
    if (uses !== 1) continue;
    const x = (points[a][0] + points[b][0]) / 2,
      y = (points[a][1] + points[b][1]) / 2;
    const opening =
      y < -0.98 ||
      (Math.abs(x) > 0.99 && y < 0.72) ||
      (Math.abs(x) < 0.23 && y > 0.88);
    if (!opening) sideIndex.push(a, b + count, b, a, a + count, b + count);
  }
  for (let i = 0; i < count; i++) springs.push(i, i + count);
  const pinned: number[] = [];
  points.forEach(([x, y], i) => {
    if (y > 0.72 && Math.abs(x) < 0.72) pinned.push(i, i + count);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex([...frontIndex, ...backIndex, ...sideIndex]);
  geometry.clearGroups();
  // Front and back have their own print, including a correctly oriented reverse side.
  geometry.addGroup(0, frontIndex.length, 0);
  geometry.addGroup(frontIndex.length, backIndex.length, 1);
  geometry.addGroup(frontIndex.length + backIndex.length, sideIndex.length, 0);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return {
    geometry,
    solver: new ClothDynamics(new Float32Array(positions), springs, pinned),
  };
}

async function garmentTexture(
  design: ShirtDesign,
  side: 'front' | 'back',
  signal: AbortSignal,
) {
  const response = await fetch(design[side], { signal });
  if (!response.ok) throw new Error('No se pudo cargar el estampado');
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = design.color;
  ctx.fillRect(0, 0, 1024, 1024);
  const xy = (x: number, y: number) => [
    ((x + 1.25) / 2.5) * 1024,
    ((1.1 - y) / 2.2) * 1024,
  ];
  const draw = (
    source: CanvasImageSource,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    const [cx, cy] = xy(x, y);
    ctx.drawImage(
      source,
      cx - (w / 2 / 2.5) * 1024,
      cy - (h / 2 / 2.2) * 1024,
      (w / 2.5) * 1024,
      (h / 2.2) * 1024,
    );
  };
  if (design.year === 2023) {
    const print = document.createElement('canvas');
    print.width = side === 'front' ? 105 : 345;
    print.height = side === 'front' ? 105 : 370;
    const c = print.getContext('2d')!;
    if (side === 'front')
      c.drawImage(bitmap, 415, 265, 105, 105, 0, 0, 105, 105);
    else {
      c.drawImage(bitmap, 995, 255, 345, 95, 0, 0, 345, 95);
      c.drawImage(bitmap, 1025, 600, 280, 25, 32, 345, 280, 25);
    }
    const pixels = c.getImageData(0, 0, print.width, print.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (!pixels.data[i + 3]) continue;
      const darkness =
        255 - Math.max(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 25;
      pixels.data[i + 3] = Math.max(0, Math.min(255, (darkness - 90) * 2.4));
    }
    c.putImageData(pixels, 0, 0);
    let minX = print.width,
      minY = print.height,
      maxX = 0,
      maxY = 0;
    for (let y = 0; y < print.height; y++)
      for (let x = 0; x < print.width; x++) {
        if (pixels.data[(y * print.width + x) * 4 + 3] < 30) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    const trimmed = document.createElement('canvas');
    trimmed.width = maxX - minX + 1;
    trimmed.height = maxY - minY + 1;
    trimmed
      .getContext('2d')!
      .drawImage(
        print,
        minX,
        minY,
        trimmed.width,
        trimmed.height,
        0,
        0,
        trimmed.width,
        trimmed.height,
      );
    const width = side === 'front' ? 0.43 : 1.13;
    draw(
      trimmed,
      0,
      side === 'front' ? 0.43 : 0.12,
      width,
      (width * trimmed.height) / trimmed.width,
    );
  } else if (side === 'front') {
    const ratio = bitmap.width / bitmap.height;
    draw(bitmap, 0.32, 0.47, 0.27, 0.27 / ratio);
  } else {
    const ratio = bitmap.width / bitmap.height;
    const w = Math.min(design.printWidth, design.printHeight * ratio),
      h = w / ratio;
    draw(bitmap, 0, 0.12, w, h);
  }
  bitmap.close();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export async function makeClothShirt(design: ShirtDesign, signal: AbortSignal) {
  const textures = await Promise.allSettled([
    garmentTexture(design, 'front', signal),
    garmentTexture(design, 'back', signal),
  ]);
  if (textures.some((t) => t.status === 'rejected')) {
    textures.forEach((t) => {
      if (t.status === 'fulfilled') t.value.dispose();
    });
    throw new Error('No se pudo cargar la camiseta');
  }
  const front = (textures[0] as PromiseFulfilledResult<THREE.Texture>).value;
  const back = (textures[1] as PromiseFulfilledResult<THREE.Texture>).value;
  const { geometry, solver } = clothTopology();
  const materials = [front, back].map(
    (map) =>
      new THREE.MeshStandardMaterial({
        map,
        roughness: 0.96,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
  );
  const mesh = new THREE.Mesh(geometry, materials);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.add(mesh);
  group.position.y = -0.15;
  const wood = new THREE.MeshStandardMaterial({
    color: '#c69a64',
    roughness: 0.8,
  });
  const bar = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    r: number,
    material: THREE.Material,
  ) => {
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r, a.distanceTo(b), 8),
      material,
    );
    tube.position.copy(a).add(b).multiplyScalar(0.5);
    tube.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    group.add(tube);
  };
  const center = new THREE.Vector3(0, 0.97, 0),
    left = new THREE.Vector3(-0.69, 0.85, 0),
    right = new THREE.Vector3(0.69, 0.85, 0);
  bar(center, left, 0.027, wood);
  bar(center, right, 0.027, wood);
  bar(left, right, 0.018, wood);
  const v = (x: number, y: number) => new THREE.Vector3(x, y, 0);
  const hookCurve = new THREE.CurvePath<THREE.Vector3>();
  hookCurve.add(new THREE.LineCurve3(v(0, 0.97), v(0, 1.16)));
  hookCurve.add(
    new THREE.CubicBezierCurve3(
      v(0, 1.16),
      v(0, 1.21),
      v(-0.1, 1.18),
      v(-0.1, 1.29),
    ),
  );
  hookCurve.add(
    new THREE.CubicBezierCurve3(
      v(-0.1, 1.29),
      v(-0.1, 1.42),
      v(0.11, 1.42),
      v(0.11, 1.29),
    ),
  );
  hookCurve.add(new THREE.LineCurve3(v(0.11, 1.29), v(0.11, 1.25)));
  group.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(hookCurve, 24, 0.009, 6, false),
      new THREE.MeshStandardMaterial({
        color: '#a4a6a4',
        metalness: 0.8,
        roughness: 0.25,
      }),
    ),
  );
  return {
    group,
    radius: 1.5,
    update(dt: number, spin: number, acceleration: number) {
      solver.step(dt, { spin, acceleration });
      (geometry.getAttribute('position') as THREE.BufferAttribute).array.set(
        solver.positions,
      );
      geometry.getAttribute('position').needsUpdate = true;
      geometry.computeVertexNormals();
    },
    reset: () => {
      solver.reset();
      (geometry.getAttribute('position') as THREE.BufferAttribute).array.set(
        solver.positions,
      );
      geometry.getAttribute('position').needsUpdate = true;
      geometry.computeVertexNormals();
    },
  };
}
