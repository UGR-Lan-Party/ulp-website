import * as THREE from 'three';
import swordPixels from '../data/minecraft-iron-sword.json' with { type: 'json' };

function skinBox(width, height, depth, u, v, inflate = 0) {
  const box = new THREE.BoxGeometry(
    width + inflate,
    height + inflate,
    depth + inflate,
  );
  const uv = box.getAttribute('uv');
  const rectangles = [
    [u + depth + width, v + depth, depth, height],
    [u, v + depth, depth, height],
    [u + depth, v, width, depth],
    [u + depth + width, v, width, depth],
    [u + depth, v + depth, width, height],
    [u + depth * 2 + width, v + depth, width, height],
  ];
  rectangles.forEach(([x, y, w, h], face) => {
    const top = 1 - y / 64,
      bottom = 1 - (y + h) / 64,
      left = x / 64,
      right = (x + w) / 64;
    const values =
      face === 3
        ? [left, bottom, right, bottom, left, top, right, top]
        : [left, top, right, top, left, bottom, right, bottom];
    for (let i = 0; i < 4; i++)
      uv.setXY(face * 4 + i, values[i * 2], values[i * 2 + 1]);
  });
  return box;
}

function ironSword(texture) {
  const positions = [],
    uv = [];
  const { width, height, mask } = swordPixels;
  const opaque = (x, y) =>
    x >= 0 && y >= 0 && x < width && y < height && mask[y][x] === '#';
  const quad = (points, coordinates) => {
    for (const i of [0, 1, 2, 0, 2, 3]) {
      positions.push(...points[i]);
      uv.push(...coordinates[i]);
    }
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (!opaque(x, y)) continue;
      const left = x - 2.5,
        right = left + 1,
        top = 13.5 - y,
        bottom = top - 1,
        z = 0.4;
      const u0 = x / width,
        u1 = (x + 1) / width,
        v0 = 1 - y / height,
        v1 = 1 - (y + 1) / height;
      quad(
        [
          [left, bottom, z],
          [right, bottom, z],
          [right, top, z],
          [left, top, z],
        ],
        [
          [u0, v1],
          [u1, v1],
          [u1, v0],
          [u0, v0],
        ],
      );
      quad(
        [
          [right, bottom, -z],
          [left, bottom, -z],
          [left, top, -z],
          [right, top, -z],
        ],
        [
          [u1, v1],
          [u0, v1],
          [u0, v0],
          [u1, v0],
        ],
      );
      const color = Array.from({ length: 4 }, () => [
        (u0 + u1) / 2,
        (v0 + v1) / 2,
      ]);
      if (!opaque(x - 1, y))
        quad(
          [
            [left, bottom, -z],
            [left, bottom, z],
            [left, top, z],
            [left, top, -z],
          ],
          color,
        );
      if (!opaque(x + 1, y))
        quad(
          [
            [right, bottom, z],
            [right, bottom, -z],
            [right, top, -z],
            [right, top, z],
          ],
          color,
        );
      if (!opaque(x, y - 1))
        quad(
          [
            [left, top, z],
            [right, top, z],
            [right, top, -z],
            [left, top, -z],
          ],
          color,
        );
      if (!opaque(x, y + 1))
        quad(
          [
            [left, bottom, -z],
            [right, bottom, -z],
            [right, bottom, z],
            [left, bottom, z],
          ],
          color,
        );
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.85,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
  });
  const sword = new THREE.Group();
  sword.name = 'iron-sword';
  sword.scale.setScalar(0.85);
  sword.add(new THREE.Mesh(geometry, material));
  return sword;
}

function groundShadow() {
  const size = 128,
    pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const radius = Math.hypot(
        (x - size / 2) / (size / 2),
        (y - size / 2) / (size / 2),
      );
      const at = (y * size + x) * 4;
      pixels[at] = 0;
      pixels[at + 1] = 20;
      pixels[at + 2] = 24;
      pixels[at + 3] = Math.round(
        90 *
          Math.exp(-radius * radius * 2) *
          Math.pow(Math.max(0, 1 - radius * radius), 2),
      );
    }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.needsUpdate = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.35),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.name = 'ground-shadow';
  return shadow;
}

/** Builds the avatar and the original Minecraft item without changing the skin atlas. */
export function createMinecraftAvatar(
  texture,
  swordTexture = new THREE.Texture(),
) {
  const base = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 1,
    alphaTest: 0.5,
  });
  const outer = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 1,
    alphaTest: 0.1,
    side: THREE.DoubleSide,
  });
  const group = new THREE.Group();
  group.name = 'ulp-minecraft-avatar';
  const part = (name, dimensions, uv, overlay, position) => {
    const [w, h, d] = dimensions,
      pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.set(...position);
    const inside = new THREE.Mesh(skinBox(w, h, d, uv[0], uv[1]), base);
    const outside = new THREE.Mesh(
      skinBox(w, h, d, overlay[0], overlay[1], name === 'head' ? 1 : 0.5),
      outer,
    );
    if (name.includes('Arm') || name.includes('Leg'))
      inside.position.y = outside.position.y = -h / 2;
    pivot.add(inside, outside);
    group.add(pivot);
    return pivot;
  };
  const head = part('head', [8, 8, 8], [0, 0], [32, 0], [0, 12, 0]);
  head.rotation.x = 0.07;
  part('body', [8, 12, 4], [16, 16], [16, 32], [0, 2, 0]);
  const rightArm = part('rightArm', [4, 12, 4], [40, 16], [40, 32], [-6, 8, 0]);
  const leftArm = part('leftArm', [4, 12, 4], [32, 48], [48, 48], [6, 8, 0]);
  rightArm.rotation.set(0.4, 0, -0.12);
  leftArm.rotation.set(-1.0, 0, 0.12);
  const rightLeg = part('rightLeg', [4, 12, 4], [0, 16], [0, 32], [-2, -4, 0]);
  const leftLeg = part('leftLeg', [4, 12, 4], [16, 48], [0, 48], [2, -4, 0]);
  rightLeg.rotation.set(-0.28, 0, -0.08);
  leftLeg.rotation.set(0.32, 0, 0.1);
  const sword = ironSword(swordTexture);
  sword.position.set(0, -10.5, 0.5);
  sword.rotation.set(1.0, Math.PI / 2, 0.62 + Math.PI / 6);
  leftArm.add(sword);
  group.scale.setScalar(0.075);
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(group),
    center = bounds.getCenter(new THREE.Vector3());
  group.position.sub(center);
  group.updateMatrixWorld(true);
  const feet = new THREE.Box3()
    .setFromObject(rightLeg)
    .union(new THREE.Box3().setFromObject(leftLeg));
  const ground = new THREE.Group();
  ground.name = 'avatar-ground';
  const shadow = groundShadow();
  const feetCenter = feet.getCenter(new THREE.Vector3());
  shadow.position.set(feetCenter.x, feet.min.y - 0.02, feetCenter.z);
  ground.add(shadow);
  const display = new THREE.Group();
  display.add(group, ground);
  display.updateMatrixWorld(true);
  const finalBounds = new THREE.Box3().setFromObject(display);
  display.position.sub(finalBounds.getCenter(new THREE.Vector3()));
  const radius = finalBounds.getBoundingSphere(new THREE.Sphere()).radius;
  return { group: display, radius };
}
