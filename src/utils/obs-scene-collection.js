import { overlaySettings, overlayText } from './overlay-customizer.js';

export function obsUuid() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
export function buildObsCollection(
  profileName,
  includeBackground = true,
  uuid = obsUuid,
) {
  const game = overlayText(profileName, 'General', 40);
  const source = (name, id, settings) => ({
    name,
    uuid: uuid(),
    id,
    versioned_id: id,
    settings,
    mixers: 0,
    sync: 0,
    flags: 0,
    volume: 1,
    balance: 0.5,
    enabled: true,
    muted: false,
    hotkeys: {},
    private_settings: {},
  });
  const image = (name, file) =>
    source(name, 'image_source', { file, unload: false });
  const background = image('ULP · Fondo', './recursos/fondo.png');
  const overlay = image(
    'ULP · Overlay personalizado',
    './recursos/overlay.png',
  );
  const opening = image('ULP · Inicio', './recursos/inicio.png');
  const pause = image('ULP · Pausa', './recursos/pausa.png');
  const final = image('ULP · Final', './recursos/final.png');
  const scene = (name, sources) =>
    source(name, 'scene', {
      id_counter: sources.length,
      custom_size: false,
      items: sources.map(({ source: input, visible = true }, index) => ({
        name: input.name,
        source_uuid: input.uuid,
        visible,
        locked: true,
        rot: 0,
        align: 5,
        bounds_type: 2,
        bounds_align: 5,
        bounds_crop: false,
        crop_left: 0,
        crop_top: 0,
        crop_right: 0,
        crop_bottom: 0,
        id: index + 1,
        pos: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        bounds: { x: 1920, y: 1080 },
        scale_filter: 'bilinear',
        blend_method: 'default',
        blend_type: 'normal',
        private_settings: {},
      })),
    });
  const gameScene = scene('Tu juego', []);
  const startScene = scene('Inicio', [
    { source: background },
    { source: opening },
  ]);
  const liveScene = scene('Partida', [
    { source: background, visible: Boolean(includeBackground) },
    { source: gameScene },
    { source: overlay },
  ]);
  const pauseScene = scene('Pausa', [
    { source: background },
    { source: pause },
  ]);
  const finalScene = scene('Final', [
    { source: background },
    { source: final },
  ]);
  return {
    name: `ULP 2026 · ${game}`,
    current_scene: 'Inicio',
    current_program_scene: 'Inicio',
    scene_order: [startScene, liveScene, pauseScene, finalScene, gameScene].map(
      (s) => ({ name: s.name }),
    ),
    sources: [
      background,
      overlay,
      opening,
      pause,
      final,
      gameScene,
      startScene,
      liveScene,
      pauseScene,
      finalScene,
    ],
    groups: [],
    transitions: [],
    quick_transitions: [
      { name: 'Fade', duration: 300, hotkeys: [], id: 1, fade_to_black: false },
    ],
    current_transition: 'Fade',
    transition_duration: 300,
    preview_locked: false,
    resolution: { x: 1920, y: 1080 },
    version: 2,
  };
}

export function drawObsCard(ctx, kind, profileName, input) {
  const settings = overlaySettings(input),
    game = overlayText(profileName, 'General', 40);
  const labels = {
    inicio: ['Enseguida empezamos', `${settings.teamA} vs ${settings.teamB}`],
    pausa: ['Volvemos en un momento', 'La partida continúa en breve'],
    final: [
      'Hasta la próxima partida',
      `${settings.teamA} ${settings.scoreA} — ${settings.scoreB} ${settings.teamB}`,
    ],
  };
  const [title, subtitle] = labels[kind] || labels.inicio;
  ctx.clearRect(0, 0, 1920, 1080);
  const gradient = ctx.createLinearGradient(270, 300, 1650, 780);
  gradient.addColorStop(0, '#004465f5');
  gradient.addColorStop(1, '#063349f5');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(220, 275, 1480, 530, 24);
  ctx.fill();
  ctx.fillStyle = '#80d5c6';
  ctx.fillRect(880, 275, 160, 4);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5f0e6';
  ctx.font = '550 22px "Inter Variable", Arial, sans-serif';
  ctx.fillText(`UGR LAN PARTY / ${game.toLocaleUpperCase('es')}`, 960, 375);
  let size = 76;
  ctx.font = `italic ${size}px Georgia, serif`;
  while (ctx.measureText(title).width > 1300 && size > 40) {
    size--;
    ctx.font = `italic ${size}px Georgia, serif`;
  }
  ctx.fillText(title, 960, 515);
  size = 34;
  ctx.font = `600 ${size}px "Inter Variable", Arial, sans-serif`;
  while (ctx.measureText(subtitle).width > 1280 && size > 18) {
    size--;
    ctx.font = `600 ${size}px "Inter Variable", Arial, sans-serif`;
  }
  ctx.fillText(subtitle, 960, 635);
  ctx.font = '500 18px "Inter Variable", Arial, sans-serif';
  ctx.fillStyle = '#c1d0cd';
  ctx.fillText('ETSIIT · GRANADA · 2026', 960, 735);
}

export const obsImportInstructions = `KIT ULP PARA OBS

1. Descomprime TODO el ZIP en una carpeta permanente. Mantén el JSON junto a la carpeta recursos.
2. En OBS: Colección de escenas > Importar. Selecciona coleccion-ulp.json y pulsa Importar.
3. Selecciona la colección ULP 2026 del juego elegido. Las escenas Inicio, Partida, Pausa y Final quedan preparadas.
4. En la escena Tu juego, añade tu captura de juego, ventana o pantalla. Se mostrará debajo del overlay en Partida.
5. Comprueba el audio que quieras usar y el lienzo de 1920 × 1080 en Ajustes > Vídeo.

Si OBS indica archivos ausentes, usa Buscar directorio y selecciona la carpeta recursos incluida.
Importa el JSON mediante el menú de OBS: las rutas relativas se resuelven durante la importación.
Los textos y marcadores quedan guardados en el PNG. Para cambiarlos, genera otro pack desde el editor.
`;
