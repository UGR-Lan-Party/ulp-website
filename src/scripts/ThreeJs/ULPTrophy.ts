import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

async function getText(path: string, signal: AbortSignal) {
  const response = await fetch(path, { signal });
  if (!response.ok)
    throw new Error(`No se pudo cargar el modelo: ${response.status}`);
  return response.text();
}

export async function loadTrophy(path: string, signal: AbortSignal) {
  const base = path.slice(0, path.lastIndexOf('/') + 1);
  const materials = new MTLLoader().parse(
    await getText(path.replace(/\.obj$/, '.mtl'), signal),
    base,
  );
  try {
    const object = new OBJLoader()
      .setMaterials(materials)
      .parse(await getText(path, signal));
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeVertexNormals();
        const entries = Array.isArray(child.material)
          ? child.material
          : [child.material];
        entries.forEach((material) => {
          material.side = THREE.DoubleSide;
        });
      }
    });
    object.scale.setScalar(50);
    return object;
  } catch (error) {
    Object.values(materials.materials).forEach((material) =>
      material.dispose(),
    );
    throw error;
  }
}
