import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class ULPTrophy extends THREE.Object3D {
  constructor(competition: string) {
    super();

    // Usar el valor de competition para la ruta
    const trophyModelPath = `/assets/models/${competition}.obj`;

    const trophy = new OBJLoader();
    trophy.load(trophyModelPath, (object: THREE.Object3D) => {
      object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: 0xffd700,
            emissive: 0x322b06,
            roughness: 0.3,
            metalness: 0.8,
            reflectivity: 0,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      object.rotateX(-Math.PI / 2);

      this.add(object);
    });

    const base = new OBJLoader();
    base.load(
      '/assets/models/BaseULP.obj',
      (object: THREE.Object3D) => {
        object.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0x141414,
              emissive: 0x030303,
              roughness: 0.3,
              metalness: 0.8,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        object.rotateX(-Math.PI / 2);

        this.add(object);
      },
    );

    const ULPLogo = new OBJLoader();
    ULPLogo.load(
      '/assets/models/LogoULP.obj',
      (object: THREE.Object3D) => {
        object.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({
              color: 0xffffff,
              shininess: 100,
              emissive: 0x47401a,
              specular: 0xffffff,
            });
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        object.rotateX(-Math.PI / 2);

        this.add(object);
      },
    );
  }

  update() {
    this.rotation.y += 0.005;
  }
}