import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createMinecraftAvatar } from '../src/utils/minecraft-avatar.js';
import {
  nearestEquivalentAngle,
  fittedDistance,
} from '../src/utils/collectible-view.js';

test('La skin conserva piernas rectas, espada original y sombra, sin equipo de pesca', () => {
  const swordTexture = new THREE.Texture();
  const { group } = createMinecraftAvatar(new THREE.Texture(), swordTexture);
  for (const name of ['rightLeg', 'leftLeg']) {
    const leg = group.getObjectByName(name);
    assert.equal(leg.children.length, 2);
    const bounds = new THREE.Box3().setFromBufferAttribute(
      leg.children[0].geometry.getAttribute('position'),
    );
    assert.equal(bounds.max.y - bounds.min.y, 12);
  }
  assert.equal(group.getObjectByName('rightKnee'), undefined);
  for (const name of ['fishing-rod', 'fishing-line', 'fishing-bobber'])
    assert.equal(group.getObjectByName(name), undefined);
  const sword = group.getObjectByName('iron-sword');
  assert.equal(sword.parent.name, 'leftArm');
  assert.equal(sword.children[0].material.map, swordTexture);
  const shadow = group.getObjectByName('ground-shadow');
  assert(shadow.material.transparent);
  const pixels = shadow.material.map.image.data;
  assert.equal(pixels[3], 0);
  assert(pixels[(64 * 128 + 64) * 4 + 3] > 60);
});

test('El avatar, sus objetos y su sombra caben al girar y al máximo zoom en móvil y escritorio', () => {
  const { group } = createMinecraftAvatar(new THREE.Texture());
  group.updateMatrixWorld(true);
  const points = [];
  group.traverse((child) => {
    if (!child.isMesh) return;
    const vertices = child.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++)
      points.push(
        new THREE.Vector3()
          .fromBufferAttribute(vertices, i)
          .applyMatrix4(child.matrixWorld)
          .toArray(),
      );
  });
  const pivot = new THREE.Group();
  pivot.add(group);
  for (const aspect of [0.65, 1, 1.4, 2.5]) {
    const camera = new THREE.PerspectiveCamera(39, aspect, 0.01, 100);
    const angle = THREE.MathUtils.degToRad(39) / 2;
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
    for (const pitch of [0, 0.08, 0.65])
      for (const yaw of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        const comfort = fittedDistance(
          points,
          pitch,
          yaw,
          Math.tan(angle),
          aspect,
          0.84,
        );
        const closest = fittedDistance(
          points,
          pitch,
          yaw,
          Math.tan(angle),
          aspect,
          0.96,
        );
        camera.position.z = Math.max(closest, comfort / 1.16);
        camera.updateMatrixWorld(true);
        pivot.rotation.set(pitch, yaw, 0);
        pivot.updateMatrixWorld(true);
        group.traverse((child) => {
          if (!child.isMesh) return;
          const vertices = child.geometry.getAttribute('position'),
            point = new THREE.Vector3();
          for (let i = 0; i < vertices.count; i++) {
            point
              .fromBufferAttribute(vertices, i)
              .applyMatrix4(child.matrixWorld)
              .project(camera);
            assert(
              Math.abs(point.x) < 0.97 &&
                Math.abs(point.y) < 0.97 &&
                Math.abs(point.z) < 1,
              `${child.name}: fuera del encuadre`,
            );
          }
        });
      }
  }
});

test('Restablecer el visor toma el camino corto después de vueltas completas en ambos sentidos', () => {
  for (const turns of [-100, -4, 0, 7, 100])
    for (const offset of [-2.7, -0.1, 0.4, 2.8]) {
      const current = turns * Math.PI * 2 + offset;
      const target = nearestEquivalentAngle(current, 0.4);
      assert(Math.abs(target - current) <= Math.PI);
      assert(Math.abs(Math.sin(target - 0.4)) < 1e-10);
      assert(Math.cos(target - 0.4) > 0.999999);
    }
});
