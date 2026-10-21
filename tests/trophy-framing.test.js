import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  trophyFitDistance,
  measureTrophyBounds,
} from '../src/utils/trophy-framing.js';

test('Todos los trofeos caben al máximo zoom en móvil y escritorio mientras giran', () => {
  const directory = new URL('../public/assets/models/', import.meta.url);
  const files = readdirSync(directory).filter((file) => file.endsWith('.obj'));
  assert(files.length > 0);
  for (const file of files) {
    const model = new OBJLoader().parse(
      readFileSync(new URL(file, directory), 'utf8'),
    );
    model.scale.setScalar(50);
    const boxSphere = new THREE.Box3()
      .setFromObject(model)
      .getBoundingSphere(new THREE.Sphere());
    const sphere = measureTrophyBounds(model);
    assert(
      sphere.radius <= boxSphere.radius + 1e-6,
      `${file}: el límite debe ser más ajustado`,
    );
    model.position.sub(sphere.center);
    const pivot = new THREE.Group();
    pivot.add(model);
    for (const aspect of [0.5, 0.8, 1, 1.4, 2.4]) {
      const camera = new THREE.PerspectiveCamera(
        45,
        aspect,
        sphere.radius * 0.001,
        sphere.radius * 100,
      );
      const distance = trophyFitDistance(sphere.radius, camera.fov, aspect);
      for (const elevation of [0, Math.PI / 6, Math.PI / 2]) {
        camera.position.set(
          Math.cos(elevation) * distance,
          Math.sin(elevation) * distance,
          0,
        );
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld(true);
        for (const rotation of [0, Math.PI / 4, Math.PI / 2, Math.PI]) {
          pivot.rotation.y = rotation;
          pivot.updateMatrixWorld(true);
          model.traverse((child) => {
            if (!child.isMesh) return;
            const positions = child.geometry.attributes.position;
            const point = new THREE.Vector3();
            for (let i = 0; i < positions.count; i++) {
              point
                .fromBufferAttribute(positions, i)
                .applyMatrix4(child.matrixWorld)
                .project(camera);
              assert(
                Math.abs(point.x) <= 0.941 &&
                  Math.abs(point.y) <= 0.941 &&
                  Math.abs(point.z) <= 1,
                `${file}: vértice fuera del encuadre (${aspect}, ${elevation}, ${rotation})`,
              );
            }
          });
        }
      }
    }
    model.traverse((child) => {
      if (child.isMesh) child.geometry.dispose();
    });
  }
});
