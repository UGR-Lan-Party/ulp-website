import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export class ULPTrophy extends THREE.Object3D {
  constructor(competition: string) {
    super();

    // competition sería la ruta sin extensión, ej: '/assets/models/TrofeoULP'
    // O puedes seguir pasando la ruta del .obj y derivar el .mtl
    const mtlPath = competition.replace('.obj', '.mtl');

    // --- Trofeo principal ---
    const trophyMtlLoader = new MTLLoader();
    trophyMtlLoader.load(mtlPath, (materials) => {
      materials.preload();

      // Forzar DoubleSide en todos los materiales del MTL
      Object.values(materials.materials).forEach((mat) => {
        mat.side = THREE.DoubleSide;
      });

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(competition, (object) => {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Recalcular normales por si acaso
            child.geometry.computeVertexNormals();
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        object.scale.set(50, 50, 50);
        this.add(object);
      });
    });
  }

  update() {
    this.rotation.y += 0.005;
  }
}
