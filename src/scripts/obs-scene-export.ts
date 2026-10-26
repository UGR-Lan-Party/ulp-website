import {
  buildObsCollection,
  drawObsCard,
  obsImportInstructions,
} from '../utils/obs-scene-collection.js';
import { createStoredZip } from '../utils/zip-store.js';
import type { overlaySettings } from '../utils/overlay-customizer.js';

export async function createObsScenePack(options: {
  profileName: string;
  settings: ReturnType<typeof overlaySettings>;
  overlay: Blob;
  background: string;
  includeBackground: boolean;
}) {
  if (
    !/^\/assets\/streamers\/2026\/originales\/[a-z-]+\.png$/.test(
      options.background,
    )
  )
    throw new Error('Fondo no válido');
  const response = await fetch(options.background);
  if (!response.ok) throw new Error('No se pudo cargar el fondo');
  const background = new Uint8Array(await response.arrayBuffer());
  const encoder = new TextEncoder();
  const entries = [
    {
      name: 'coleccion-ulp.json',
      bytes: encoder.encode(
        JSON.stringify(
          buildObsCollection(options.profileName, options.includeBackground),
          null,
          2,
        ),
      ),
    },
    {
      name: 'IMPORTAR-EN-OBS.txt',
      bytes: encoder.encode(obsImportInstructions),
    },
    { name: 'recursos/fondo.png', bytes: background },
    {
      name: 'recursos/overlay.png',
      bytes: new Uint8Array(await options.overlay.arrayBuffer()),
    },
  ];
  for (const kind of ['inicio', 'pausa', 'final']) {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    drawObsCard(
      canvas.getContext('2d')!,
      kind,
      options.profileName,
      options.settings,
    );
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error('No se pudo crear la escena')),
        'image/png',
      ),
    );
    entries.push({
      name: `recursos/${kind}.png`,
      bytes: new Uint8Array(await blob.arrayBuffer()),
    });
    canvas.width = 1;
  }
  return createStoredZip(entries);
}
