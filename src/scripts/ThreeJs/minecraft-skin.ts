import * as THREE from 'three';
import { createMinecraftAvatar } from '../../utils/minecraft-avatar.js';

async function loadTexture(path: string, signal: AbortSignal) {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error('Textura de Minecraft no disponible');
  const bitmap = await createImageBitmap(await response.blob(), {
    imageOrientation: 'flipY',
  });
  const texture = new THREE.Texture(bitmap);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return { texture, bitmap };
}

export async function makeMinecraftSkin(path: string, signal: AbortSignal) {
  const results = await Promise.allSettled([
    loadTexture(path, signal),
    loadTexture('/assets/activities/minecraft/iron-sword.png', signal),
  ]);
  if (results.some((r) => r.status === 'rejected')) {
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        r.value.texture.dispose();
        r.value.bitmap.close();
      }
    });
    throw new Error('No se pudo cargar la skin y su espada');
  }
  const [skin, sword] = results.map(
    (r) =>
      (r as PromiseFulfilledResult<Awaited<ReturnType<typeof loadTexture>>>)
        .value,
  );
  const model = createMinecraftAvatar(skin.texture, sword.texture);
  return {
    ...model,
    dispose: () => {
      skin.bitmap.close();
      sword.bitmap.close();
    },
  };
}
