import { Mesh, MeshPhongMaterial } from 'three';
import type { Group } from 'three';

export function applyTrophyFinish(trophy: Group) {
  const materials = new Set<MeshPhongMaterial>();
  trophy.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    const entries = Array.isArray(child.material)
      ? child.material
      : [child.material];
    for (const material of entries) {
      if (!(material instanceof MeshPhongMaterial) || materials.has(material))
        continue;
      materials.add(material);
      material.shininess = Math.max(material.shininess, 96);
      material.specular.multiplyScalar(0.65);
      material.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <opaque_fragment>',
          `
          float rim = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
          outgoingLight += diffuseColor.rgb * rim * rim * rim * 0.18;
          #include <opaque_fragment>
        `,
        );
      };
      material.customProgramCacheKey = () => 'ulp-trophy-rim-v1';
      material.needsUpdate = true;
    }
  });
}
