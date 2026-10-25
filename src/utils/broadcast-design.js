import { overlayText, overlayScore } from './overlay-customizer.js';
export const studioScenes = [
  'live',
  'webcam',
  'dual',
  'interview',
  'rotulo',
  'marcador',
  'countdown',
  'inicio',
  'pausa',
  'final',
];
export function studioSettings(input = {}) {
  input =
    input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const text = (key, fallback, limit = 40) =>
    overlayText(input[key], fallback, limit);
  return {
    activity: text('activity', 'Directo general', 80),
    activityId: text('activityId', 'general', 64),
    captureRatio: ['16:9', '4:3', '9:16', '1:1'].includes(input.captureRatio)
      ? input.captureRatio
      : 'auto',
    scoreMode: ['duel', 'record'].includes(input.scoreMode)
      ? input.scoreMode
      : 'auto',
    resultLabel: text('resultLabel', 'Mejor marca', 32),
    resultValue: text('resultValue', '—', 32),
    interviewTitle: text('interviewTitle', 'Conversamos con la comunidad', 64),
    chat: input.chat !== false,
    channel: text('channel', 'UGR LAN Party'),
    title: text('title', 'La próxima partida empieza aquí', 64),
    eyebrow: text('eyebrow', 'EN DIRECTO', 32),
    subtitle: text('subtitle', 'ETSIIT · Granada', 60),
    social: text('social', '@ugrlanparty'),
    round: text('round', 'Gran final · BO3', 36),
    webcamLabel: text('webcamLabel', 'Tu nombre / caster', 36),
    webcamLabel2: text('webcamLabel2', 'Segundo caster', 36),
    teamA: text('teamA', 'Equipo A', 36),
    teamB: text('teamB', 'Equipo B', 36),
    scoreA: overlayScore(input.scoreA),
    scoreB: overlayScore(input.scoreB),
    opening: text('opening', 'Enseguida empezamos', 64),
    countdownTitle: text('countdownTitle', 'Empezamos en', 48),
    countdownDone: text('countdownDone', '¡Empezamos!', 48),
    countdownMinutes: Number.isFinite(Number(input.countdownMinutes))
      ? Math.max(1, Math.min(180, Math.round(Number(input.countdownMinutes))))
      : 5,
    pause: text('pause', 'Volvemos en un momento', 64),
    ending: text('ending', 'Gracias por estar ahí', 64),
    output: input.output === 'vertical' ? 'vertical' : 'horizontal',
    ratio: ['16:9', '4:3', '1:1'].includes(input.ratio) ? input.ratio : '16:9',
    position: input.position === 'left' ? 'left' : 'right',
    design: ['arena', 'glass', 'minimal'].includes(input.design)
      ? input.design
      : 'arena',
    webcam: input.webcam !== false,
    scoreboard: input.scoreboard !== false,
    caption: input.caption !== false,
    border: input.border !== false,
  };
}
export function studioSize(settings = {}) {
  return settings.output === 'vertical'
    ? { w: 1080, h: 1920 }
    : { w: 1920, h: 1080 };
}

/** @typedef {{x:number,y:number,w:number,h:number}} Rect */
const profileRows = [
  [
    'general',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Señal general: captura completa y rotulación separada.',
  ],
  [
    'ajedrez',
    '1:1',
    'duel',
    1552,
    644,
    336,
    152,
    'bottom',
    'Tablero cuadrado completo; resultado lateral sin tapar casillas ni relojes.',
  ],
  [
    'minecraft',
    '16:9',
    'duel',
    480,
    970,
    1008,
    64,
    'top',
    'Barra de objetos, chat y objetivos quedan dentro de la captura; marcador de serie debajo.',
  ],
  [
    'mario-kart',
    '16:9',
    'duel',
    592,
    40,
    1152,
    64,
    'bottom',
    'Vueltas, posición, objetos y mapa se conservan; clasificación de la ULP en la franja superior.',
  ],
  [
    'league-of-legends',
    '16:9',
    'duel',
    64,
    970,
    1184,
    64,
    'bottom',
    'No se cubren estadísticas superiores, inventario, minimapa ni paneles del espectador; serie en la franja inferior.',
  ],
  [
    'rocket-league',
    '16:9',
    'duel',
    864,
    970,
    1024,
    64,
    'bottom',
    'Reloj, goles, turbo y jugador observado permanecen visibles; serie a la derecha del pie.',
  ],
  [
    'wii-sports-tenis',
    '16:9',
    'duel',
    192,
    40,
    1040,
    64,
    'top',
    'Pista y tanteo originales íntegros; sets de la ULP en la cabecera. Cambia a 4:3 si lo usa la consola.',
  ],
  [
    'wii-sports-bolos',
    '16:9',
    'record',
    432,
    970,
    1024,
    64,
    'bottom',
    'Se conservan tabla de tiradas y bolos; marca de la ronda debajo de la captura.',
  ],
  [
    'smash',
    '16:9',
    'duel',
    472,
    40,
    1056,
    64,
    'top',
    'Porcentajes, vidas y cronómetro quedan libres; marcador de sets en la cabecera exterior.',
  ],
  [
    'brawl-stars',
    '16:9',
    'duel',
    64,
    970,
    1088,
    64,
    'bottom',
    'Objetivos superiores y controles inferiores no se cubren; resultado de la serie al pie.',
  ],
  [
    'clash-royale',
    '9:16',
    'duel',
    1552,
    596,
    336,
    152,
    'top',
    'Captura vertical completa: torres, mano, elixir y reloj. En vertical, el juego se mantiene completo dentro de la mitad superior y la webcam queda debajo.',
  ],
  [
    '2XKO',
    '16:9',
    'duel',
    400,
    970,
    1104,
    64,
    'bottom',
    'Vida, asistencias y medidores de ambos extremos permanecen visibles; sets debajo de la captura.',
  ],
  [
    'f1',
    '16:9',
    'record',
    464,
    40,
    1200,
    64,
    'top',
    'Clasificación, minimapa y telemetría se conservan; vuelta o tiempo en una cabecera exterior.',
  ],
  [
    'futbolin',
    '16:9',
    'duel',
    224,
    40,
    1024,
    64,
    'top',
    'Mesa completa en cámara; tanteo en la cabecera sin ocultar porterías.',
  ],
  [
    'ping-pong',
    '16:9',
    'duel',
    704,
    970,
    1184,
    64,
    'bottom',
    'Mesa y jugadores completos; sets en la franja inferior exterior.',
  ],
  [
    'retro',
    '4:3',
    'record',
    192,
    970,
    1040,
    64,
    'top',
    'Perfil conservador 4:3: no se presupone un HUD ni una versión concretos. Ajusta el formato a la captura real.',
  ],
  [
    'street-fighter',
    '4:3',
    'duel',
    608,
    970,
    1120,
    64,
    'bottom',
    'Se conserva el encuadre arcade con vida, tiempo y medidores; sets en el pie exterior.',
  ],
  [
    'beat-saber',
    '16:9',
    'record',
    336,
    40,
    1152,
    64,
    'top',
    'Carril central, combo y puntuación de VR libres; mejor marca fuera del juego.',
  ],
  [
    'hacking',
    '16:9',
    'record',
    240,
    970,
    1088,
    64,
    'bottom',
    'Terminal y herramientas sin recortes; puntos o tiempo en el pie exterior.',
  ],
  [
    'tetris',
    '16:9',
    'record',
    1552,
    660,
    336,
    144,
    'top',
    'Tablero, reserva, cola y puntuación íntegros; mejor marca en el lateral. Ajusta el formato según la versión.',
  ],
  [
    'cars',
    '4:3',
    'record',
    528,
    40,
    1184,
    64,
    'bottom',
    'Mapa, posición y velocidad dentro de la captura; tiempo de Copa Pistón en cabecera. Ajusta 4:3 o 16:9 a la versión.',
  ],
  [
    'street-pass',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Encuentro de comunidad: sin marcador competitivo por defecto.',
  ],
  [
    'watch-party',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'La señal original conserva sus gráficos; no se añade un segundo marcador por defecto.',
  ],
  [
    'tcg',
    '16:9',
    'duel',
    736,
    40,
    1152,
    64,
    'bottom',
    'Zona de cartas y manos completa; resultado fuera de la mesa.',
  ],
  [
    'indie-fest',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Demostración de juegos: título y cámara, sin resultado ficticio.',
  ],
  [
    'juego-libre',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Formato flexible para demostraciones; elige la proporción real de la fuente.',
  ],
  [
    'paella',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Cámara de ambiente sin marcador competitivo.',
  ],
  [
    'concierto',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Escenario completo, sin superponer un marcador de equipos al concierto.',
  ],
  [
    'charla-1',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Ponente y presentación completos; entrevistas disponibles en escena separada.',
  ],
  [
    'charla-2',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Bienvenida: presentación y rótulo sin tanteo competitivo.',
  ],
  [
    'charla-3',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Presentación del evento sin marcador competitivo.',
  ],
  [
    'charla-4',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Diapositivas completas y cámara separada, sin tapar el texto.',
  ],
  [
    'charla-5',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Charla técnica: contenido de pantalla íntegro y sin marcador.',
  ],
  [
    'charla-7',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Despedida y sorteo: rótulo informativo sin tanteo competitivo.',
  ],
  [
    'personalizada',
    '16:9',
    'off',
    528,
    970,
    960,
    64,
    'top',
    'Composición general; selecciona formato y tipo de marcador para tu actividad.',
  ],
];
export const broadcastProfiles = Object.fromEntries(
  profileRows.map(([id, ratio, mode, x, y, w, h, vertical, note]) => [
    String(id),
    {
      ratio: String(ratio),
      mode: String(mode),
      score: { x: Number(x), y: Number(y), w: Number(w), h: Number(h) },
      vertical: String(vertical),
      note: String(note),
    },
  ]),
);
export function profileFor(settings = {}) {
  return Object.hasOwn(broadcastProfiles, settings.activityId)
    ? broadcastProfiles[settings.activityId]
    : broadcastProfiles.general;
}
export function captureSize(settings = {}) {
  const s = studioSettings(settings),
    ratio = s.captureRatio === 'auto' ? profileFor(s).ratio : s.captureRatio;
  return ratio === '9:16'
    ? { w: 1080, h: 1920 }
    : ratio === '1:1'
      ? { w: 1080, h: 1080 }
      : ratio === '4:3'
        ? { w: 1440, h: 1080 }
        : { w: 1920, h: 1080 };
}
function fit(box, ratio, top = false) {
  const [a, b] = ratio.split(':').map(Number),
    unit = Math.max(1, Math.floor(Math.min(box.w / a, box.h / b)));
  const w = a * unit,
    h = b * unit;
  return {
    x: Math.round(box.x + (box.w - w) / 2),
    y: top ? box.y : Math.round(box.y + (box.h - h) / 2),
    w,
    h,
  };
}
export function markerMode(settings = {}) {
  const s = studioSettings(settings);
  return s.scoreMode === 'auto' ? profileFor(s).mode : s.scoreMode;
}
export function broadcastLayout(settings = {}, scene = 'live') {
  const s = studioSettings(settings),
    v = s.output === 'vertical',
    profile = profileFor(s),
    left = s.position === 'left';
  const ratio = s.captureRatio === 'auto' ? profile.ratio : s.captureRatio;
  /** @type {{game:Rect|null,cameras:Rect[],chat:Rect|null,score:Rect|null,caption:Rect|null,headline:{x:number,y:number,w:number,size:number,lines:number}|null,clock:{x:number,y:number,w:number,size:number}|null,progress:Rect|null,logo:Rect}} */
  const layout = {
    game: null,
    cameras: [],
    chat: null,
    score: null,
    caption: null,
    headline: null,
    clock: null,
    progress: null,
    logo: v ? { x: 64, y: 184, w: 76, h: 76 } : { x: 48, y: 40, w: 76, h: 76 },
  };
  if (scene === 'live' || scene === 'marcador' || scene === 'rotulo') {
    if (v) {
      const topHalf = { x: 32, y: 32, w: 1016, h: 896 };
      const game = fit(topHalf, ratio);
      layout.game = game;
      layout.logo = { x: 64, y: 1000, w: 64, h: 64 };
      layout.score = { x: 64, y: 1104, w: 848, h: 64 };
      const hasScore = s.scoreboard && markerMode(s) !== 'off';
      const cam = fit(
        { x: 64, y: hasScore ? 1232 : 1120, w: 848, h: 480 },
        s.ratio,
        true,
      );
      cam.x = left ? 64 : 912 - cam.w;
      layout.cameras = s.webcam ? [cam] : [];
    } else {
      const side = left ? 32 : 1552;
      layout.game = fit(
        {
          x: s.webcam && left ? 400 : 32,
          y: 132,
          w: s.webcam ? 1488 : 1856,
          h: 828,
        },
        ratio,
      );
      layout.cameras = s.webcam
        ? [fit({ x: side, y: 132, w: 336, h: 336 }, s.ratio, true)]
        : [];
      const score = { ...profile.score };
      if (score.x >= 1500) score.x = side;
      layout.score = score;
      layout.caption =
        score.x === side && score.y > 500
          ? { x: side, y: 836, w: 336, h: 128 }
          : { x: side, y: 640, w: 336, h: 216 };
    }
    if (!s.scoreboard || markerMode(s) === 'off') layout.score = null;
    if (!s.caption || scene === 'live') layout.caption = null;
    if (scene === 'marcador') {
      layout.game = null;
      layout.cameras = [];
      layout.caption = null;
    }
    if (scene === 'rotulo') {
      layout.game = null;
      layout.cameras = [];
      layout.score = null;
      layout.caption = s.caption
        ? v
          ? { x: 64, y: 1452, w: 848, h: 128 }
          : { x: 64, y: 884, w: 1120, h: 128 }
        : null;
    }
    return layout;
  }
  if (scene === 'webcam') {
    layout.cameras = s.webcam
      ? [
          fit(
            v
              ? { x: 64, y: 320, w: 848, h: 640 }
              : s.chat
                ? { x: 48, y: 192, w: 1280, h: 720 }
                : { x: 48, y: 152, w: 1824, h: 832 },
            s.ratio,
            true,
          ),
        ]
      : [];
    if (s.chat)
      layout.chat = v
        ? { x: 64, y: 1056, w: 848, h: 424 }
        : { x: 1440, y: 256, w: 384, h: 576 };
  }
  if (scene === 'dual' || scene === 'interview') {
    if (v) {
      const h = scene === 'interview' ? 360 : 480,
        w = scene === 'interview' ? 640 : 768;
      const a = fit({ x: 64, y: 320, w: 848, h }, s.ratio, true);
      if (a.w > w) {
        Object.assign(a, fit({ x: 64, y: 320, w, h }, s.ratio, true));
      }
      a.x = Math.round((976 - a.w) / 2);
      layout.cameras = s.webcam
        ? [a, { ...a, y: scene === 'interview' ? 752 : 960 }]
        : [];
      if (scene === 'interview' && s.chat)
        layout.chat = { x: 128, y: 1216, w: 720, h: 360 };
    } else {
      const chat = scene === 'interview' && s.chat,
        cell = chat
          ? { x: 48, y: 208, w: 680, h: 624 }
          : { x: 80, y: 208, w: 840, h: 680 };
      const a = fit(cell, s.ratio),
        b = { ...a, x: a.x + (chat ? 728 : 920) };
      layout.cameras = s.webcam ? [a, b] : [];
      if (chat) layout.chat = { x: 1504, y: 232, w: 384, h: 576 };
    }
    if (scene === 'interview')
      layout.headline = {
        x: v ? 64 : 48,
        y: v ? 282 : 150,
        w: v ? 848 : 1392,
        size: v ? 34 : 46,
        lines: 1,
      };
  }
  if (['inicio', 'pausa', 'final', 'countdown'].includes(scene)) {
    const chat = s.chat && scene !== 'final';
    if (chat)
      layout.chat = v
        ? { x: 64, y: 1040, w: 848, h: 424 }
        : { x: 1360, y: 200, w: 480, h: 720 };
    if (scene === 'countdown') {
      layout.headline = v
        ? { x: 64, y: 420, w: 848, size: 76, lines: 1 }
        : { x: 112, y: 280, w: 1056, size: 82, lines: 1 };
      layout.clock = v
        ? { x: 488, y: 650, w: 848, size: 200 }
        : { x: 640, y: 500, w: 1056, size: 232 };
      layout.progress = v
        ? { x: 64, y: 800, w: 848, h: 4 }
        : { x: 112, y: 700, w: 1056, h: 4 };
      layout.caption = v
        ? { x: 64, y: 856, w: 848, h: 128 }
        : { x: 112, y: 812, w: 1056, h: 144 };
    } else {
      layout.headline = v
        ? { x: 64, y: 456, w: 848, size: 100, lines: 2 }
        : { x: 80, y: 380, w: chat ? 1160 : 1736, size: 118, lines: 2 };
      layout.caption = v
        ? { x: 64, y: chat ? 768 : 1060, w: 848, h: 144 }
        : { x: 80, y: 820, w: chat ? 1160 : 1760, h: 144 };
    }
  }
  return layout;
}
export function gameRect(settings = {}) {
  return broadcastLayout(settings).game || { x: 0, y: 0, w: 1920, h: 1080 };
}
export function cameraRects(settings = {}, scene = 'live') {
  return broadcastLayout(settings, scene).cameras;
}
export function cameraRect(settings = {}, scene = 'live') {
  return cameraRects(settings, scene)[0] || { x: 0, y: 0, w: 0, h: 0 };
}
export function chatRect(settings = {}, scene = 'inicio') {
  return broadcastLayout(settings, scene).chat;
}
export function countdownText(milliseconds) {
  let seconds = Math.max(
    0,
    Math.ceil(Number.isFinite(milliseconds) ? milliseconds / 1000 : 0),
  );
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  return `${hours ? hours + ':' : ''}${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Smooth, deterministic contour lines, inspired by the supplied topographic reference. */
export function topographicSegments(width, height) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1 ||
    width > 3840 ||
    height > 3840
  )
    return [];
  const step = 12,
    pad = 72,
    cols = Math.ceil((width + 2 * pad) / step),
    rows = Math.ceil((height + 2 * pad) / step);
  const values = new Float32Array((cols + 1) * (rows + 1));
  for (let y = 0; y <= rows; y++)
    for (let x = 0; x <= cols; x++) {
      const px = x * step - pad,
        py = y * step - pad;
      values[y * (cols + 1) + x] =
        0.92 * Math.sin(px / 170 + 1.1 * Math.sin(py / 250)) +
        0.75 * Math.cos(py / 210 - 0.8 * Math.sin(px / 270)) +
        0.3 * Math.sin((px + py) / 95) +
        0.06 * Math.sin(px / 43) * Math.sin(py / 51);
    }
  const result = [];
  for (let level = -1.7; level <= 1.71; level += 0.16)
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const i = y * (cols + 1) + x,
          v = [
            values[i],
            values[i + 1],
            values[i + cols + 2],
            values[i + cols + 1],
          ],
          px = x * step - pad,
          py = y * step - pad;
        const points = [
            [px, py],
            [px + step, py],
            [px + step, py + step],
            [px, py + step],
          ],
          cross = [];
        for (let edge = 0; edge < 4; edge++) {
          const next = (edge + 1) % 4;
          if (v[edge] >= level !== v[next] >= level) {
            const t = (level - v[edge]) / (v[next] - v[edge]);
            cross.push([
              points[edge][0] + t * (points[next][0] - points[edge][0]),
              points[edge][1] + t * (points[next][1] - points[edge][1]),
            ]);
          }
        }
        if (cross.length === 2) result.push([...cross[0], ...cross[1]]);
        else if (cross.length === 4) {
          if (v.reduce((a, b) => a + b, 0) / 4 >= level === v[0] >= level)
            result.push([...cross[0], ...cross[1]], [...cross[2], ...cross[3]]);
          else
            result.push([...cross[0], ...cross[3]], [...cross[1], ...cross[2]]);
        }
      }
  return result;
}
const contourCache = new Map();
function drawContours(ctx, w, h, time) {
  const key = `${w}x${h}`;
  let path = contourCache.get(key);
  if (!path) {
    path = new Path2D();
    for (const [x1, y1, x2, y2] of topographicSegments(w, h)) {
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
    }
    if (contourCache.size >= 4)
      contourCache.delete(contourCache.keys().next().value);
    contourCache.set(key, path);
  }
  ctx.save();
  // Animate the cached vectors: a slow drift, turn and breath with no path rebuilds.
  const scale = 1.045 + Math.sin(time / 14000) * 0.012;
  ctx.translate(
    w / 2 + Math.sin(time / 10000) * 44,
    h / 2 + Math.sin(time / 13000) * 28,
  );
  ctx.rotate(Math.sin(time / 20000) * 0.009);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  ctx.strokeStyle = '#f5f0e61c';
  ctx.lineWidth = 1.25;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);
  ctx.restore();
}
function enterLayer(ctx, rect, age, delay, draw) {
  if (!Number.isFinite(age)) {
    draw();
    return;
  }
  const t = Math.max(0, Math.min(1, (age - delay) / 440)),
    ease = 1 - Math.pow(1 - t, 3);
  if (t >= 1) {
    draw();
    return;
  }
  if (t <= 0) return;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, t * 2);
  ctx.beginPath();
  ctx.rect(rect.x - 18, rect.y - 24, (rect.w + 36) * ease, rect.h + 68);
  ctx.clip();
  draw();
  ctx.restore();
}
function background(ctx, w, h, time = 0) {
  const drift = Math.sin(time / 9000) * w * 0.18;
  const g = ctx.createLinearGradient(drift, 0, w - drift, h);
  g.addColorStop(0, '#006471');
  g.addColorStop(0.5, '#004465');
  g.addColorStop(1, '#063349');
  return g;
}
function label(
  ctx,
  value,
  x,
  y,
  width,
  size,
  weight = 550,
  align = 'left',
  color = '#f5f0e6',
  italic = false,
) {
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  let content = value;
  ctx.font = italic
    ? `italic 400 ${size}px Georgia, "Times New Roman", serif`
    : `${weight} ${size}px "Inter Variable", Arial, sans-serif`;
  while (ctx.measureText(content).width > width && size > 16) {
    size--;
    ctx.font = italic
      ? `italic 400 ${size}px Georgia, "Times New Roman", serif`
      : `${weight} ${size}px "Inter Variable", Arial, sans-serif`;
  }
  while (ctx.measureText(content).width > width && content.length > 1)
    content = Array.from(content).slice(0, -2).join('') + '…';
  ctx.fillText(content, x, y);
  ctx.restore();
}
function shapePath(ctx, x, y, w, h, design) {
  ctx.beginPath();
  if (design === 'arena') {
    const cut = Math.min(18, h / 4);
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - cut);
    ctx.lineTo(x + w - cut, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + cut);
    ctx.closePath();
  } else
    ctx.roundRect(
      x,
      y,
      w,
      h,
      Math.min(design === 'glass' ? 22 : 5, h / 2, w / 2),
    );
}
function shape(ctx, x, y, w, h, design, fill = true) {
  shapePath(ctx, x, y, w, h, design);
  if (fill) ctx.fill();
  ctx.stroke();
}
function panel(ctx, x, y, w, h, s) {
  const drift = Math.sin((s.time || 0) / 9000) * w * 0.18;
  const gradient = ctx.createLinearGradient(x + drift, y, x + w - drift, y + h);
  gradient.addColorStop(
    0,
    s.design === 'minimal'
      ? '#063349'
      : s.design === 'glass'
        ? '#006471e6'
        : '#006471',
  );
  gradient.addColorStop(0.52, s.design === 'glass' ? '#004465d9' : '#004465');
  gradient.addColorStop(1, s.design === 'glass' ? '#063349ed' : '#063349');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = 'rgba(255,255,255,.86)';
  ctx.lineWidth = s.design === 'minimal' ? 1.5 : 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 20, 38, .18)';
  ctx.shadowBlur = 12 + 2 * Math.sin((s.time || 0) / 3000);
  ctx.shadowOffsetY = 4;
  shape(ctx, x, y, w, h, s.design);
  ctx.restore();
  // A fine highlight keeps the compact ULP name plates legible on camera feeds.
  ctx.save();
  shapePath(ctx, x, y, w, h, s.design);
  ctx.clip();
  ctx.fillStyle = '#ffffff20';
  ctx.fillRect(x + 16, y + 7, Math.max(0, w - 32), 1);
  ctx.restore();
}
function logo(ctx, image, x, y, size) {
  if (image) {
    ctx.save();
    // Visible bounds of the official white SVG; preserve its proportions.
    const h = (size * 1070) / 1368;
    ctx.drawImage(image, 316, 464, 1368, 1070, x, y + (size - h) / 2, size, h);
    ctx.restore();
  } else label(ctx, 'ULP', x, y + size / 2, size + 6, 27, 800);
}

function lines(ctx, text, width, size, max = 2, italic = false) {
  ctx.font = italic
    ? `italic 400 ${size}px Georgia,serif`
    : `650 ${size}px "Inter Variable",Arial,sans-serif`;
  const result = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (
      line &&
      ctx.measureText(line + ' ' + word).width > width &&
      result.length < max - 1
    ) {
      result.push(line);
      line = word;
    } else line += (line ? ' ' : '') + word;
  }
  if (line) result.push(line);
  return result;
}
function cameraFrame(ctx, r, s, text) {
  ctx.save();
  shapePath(ctx, r.x, r.y, r.w, r.h, s.design);
  ctx.clip();
  ctx.clearRect(r.x, r.y, r.w, r.h);
  ctx.restore();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  shape(ctx, r.x, r.y, r.w, r.h, s.design, false);
  panel(ctx, r.x, r.y + r.h + 12, r.w, 40, s);
  label(
    ctx,
    text,
    r.x + 16,
    r.y + r.h + 32,
    r.w - 32,
    r.w < 400 ? 19 : 25,
    600,
    'left',
    '#fff',
  );
}
function chatFrame(ctx, r, s) {
  ctx.clearRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = '#ffffffb3';
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  panel(ctx, r.x, r.y - 44, r.w, 40, s);
  label(
    ctx,
    'CHAT EN DIRECTO',
    r.x + 18,
    r.y - 24,
    r.w - 36,
    s.output === 'vertical' ? 23 : 20,
    650,
    'left',
    '#fff',
  );
}
function scoreFrame(ctx, r, s) {
  panel(ctx, r.x, r.y, r.w, r.h, s);
  if (markerMode(s) === 'record') {
    label(
      ctx,
      s.resultLabel,
      r.x + 20,
      r.y + r.h * 0.3,
      r.w - 40,
      r.h > 100 ? 20 : 16,
      550,
      'left',
      '#fff',
    );
    label(
      ctx,
      s.resultValue,
      r.x + r.w - 20,
      r.y + r.h * 0.68,
      r.w - 40,
      r.h > 100 ? 40 : 28,
      700,
      'right',
      '#fff',
    );
  } else if (r.h > 100) {
    label(ctx, s.teamA, r.x + 18, r.y + 36, r.w - 100, 24, 650, 'left', '#fff');
    label(
      ctx,
      String(s.scoreA),
      r.x + r.w - 18,
      r.y + 36,
      64,
      36,
      700,
      'right',
      '#fff',
    );
    label(
      ctx,
      s.teamB,
      r.x + 18,
      r.y + r.h - 36,
      r.w - 100,
      24,
      650,
      'left',
      '#fff',
    );
    label(
      ctx,
      String(s.scoreB),
      r.x + r.w - 18,
      r.y + r.h - 36,
      64,
      36,
      700,
      'right',
      '#fff',
    );
  } else {
    const mid = r.x + r.w / 2,
      teamWidth = (r.w - 180) / 2;
    label(
      ctx,
      s.teamA,
      r.x + 20,
      r.y + r.h / 2,
      teamWidth,
      r.w < 900 ? 25 : 28,
      650,
      'left',
      '#fff',
    );
    label(
      ctx,
      `${s.scoreA} : ${s.scoreB}`,
      mid,
      r.y + r.h / 2,
      136,
      34,
      750,
      'center',
      '#fff',
    );
    label(
      ctx,
      s.teamB,
      r.x + r.w - 20,
      r.y + r.h / 2,
      teamWidth,
      r.w < 900 ? 25 : 28,
      650,
      'right',
      '#fff',
    );
  }
  label(ctx, s.round, r.x + r.w / 2, r.y + r.h + 17, r.w, 15, 500, 'center');
}
function captionFrame(ctx, r, s, scene) {
  panel(ctx, r.x, r.y, r.w, r.h, s);
  const informational = ['inicio', 'pausa', 'final', 'countdown'].includes(
    scene,
  );
  const title = informational ? s.activity : s.title;
  const pad = r.w < 500 ? 18 : 26,
    narrow = r.w < 500;
  label(
    ctx,
    informational ? s.subtitle : s.eyebrow.toLocaleUpperCase('es'),
    r.x + pad,
    r.y + 25,
    r.w - 2 * pad,
    narrow ? 16 : 19,
    550,
    'left',
    '#fff',
  );
  const rows = lines(
    ctx,
    title,
    r.w - 2 * pad,
    narrow ? 28 : 34,
    r.h < 170 ? 1 : narrow ? Math.max(1, Math.floor((r.h - 100) / 36)) : 2,
  );
  rows.forEach((text, i) =>
    label(
      ctx,
      text,
      r.x + pad,
      r.y + 62 + i * (narrow ? 36 : 38),
      r.w - 2 * pad,
      narrow ? 28 : 34,
      700,
      'left',
      '#fff',
    ),
  );
  label(
    ctx,
    informational ? s.social : s.subtitle + ' / ' + s.social,
    r.x + pad,
    r.y + r.h - 22,
    r.w - 2 * pad,
    narrow ? 17 : 19,
    450,
    'left',
    '#fff',
  );
}
let granadaStar;
function drawGranadaMotif(ctx, w, h) {
  granadaStar ??= new Path2D(
    'M32 0 41.4 9.4H54.6V22.6L64 32 54.6 41.4V54.6H41.4L32 64 22.6 54.6H9.4V41.4L0 32 9.4 22.6V9.4H22.6Z',
  );
  ctx.save();
  ctx.fillStyle = '#f5f0e6';
  const step = 96;
  for (let x = Math.floor((w * 0.55) / step) * step; x < w; x += step)
    for (let y = Math.floor((h * 0.48) / step) * step; y < h; y += step) {
      ctx.save();
      ctx.globalAlpha =
        0.045 *
        Math.max(0, (x / w - 0.55) / 0.45) *
        Math.max(0, (y / h - 0.48) / 0.52);
      ctx.translate(x, y);
      ctx.fill(granadaStar);
      ctx.restore();
    }
  ctx.restore();
}
export function studioPattern(scene) {
  return ['inicio', 'countdown', 'final'].includes(scene)
    ? 'granada'
    : 'curves';
}
export function drawStudioBackground(ctx, w, h, time = 0, pattern = 'curves') {
  ctx.fillStyle = background(ctx, w, h, pattern === 'curves' ? 0 : time);
  ctx.fillRect(0, 0, w, h);
  if (pattern === 'granada') drawGranadaMotif(ctx, w, h);
  else drawContours(ctx, w, h, time);
}
/** @param {CanvasImageSource | null} [logoImage] */
export function drawStudio(
  ctx,
  input,
  scene = 'live',
  logoImage = null,
  frame = {},
) {
  const s = {
    ...studioSettings(input),
    time: Number.isFinite(frame.time) ? frame.time : 0,
  };
  if (!studioScenes.includes(scene)) scene = 'live';
  const size = studioSize(s),
    layout = broadcastLayout(s, scene),
    layer = ['rotulo', 'marcador'].includes(scene),
    v = s.output === 'vertical';
  ctx.clearRect(0, 0, size.w, size.h);
  if (!layer) {
    drawStudioBackground(ctx, size.w, size.h, s.time, studioPattern(scene));
    if (s.border) {
      ctx.strokeStyle = '#ffffff70';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(20, 20, size.w - 40, size.h - 40, 20);
      ctx.stroke();
    }
    const b = layout.logo;
    logo(ctx, logoImage, b.x, b.y, b.w);
    if (scene !== 'live' || v)
      label(
        ctx,
        s.channel,
        b.x + b.w + 24,
        b.y + b.h / 2,
        v ? 700 : 1400,
        26,
        650,
      );
  }
  if (layout.game) {
    const r = layout.game;
    ctx.clearRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#ffffff80';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  }
  layout.cameras.forEach((r, i) =>
    enterLayer(ctx, { ...r, h: r.h + 52 }, frame.age, 60 + i * 70, () =>
      cameraFrame(ctx, r, s, i ? s.webcamLabel2 : s.webcamLabel),
    ),
  );
  if (layout.chat)
    enterLayer(
      ctx,
      { ...layout.chat, y: layout.chat.y - 44, h: layout.chat.h + 44 },
      frame.age,
      130,
      () => chatFrame(ctx, layout.chat, s),
    );
  if (layout.score)
    enterLayer(
      ctx,
      { ...layout.score, h: layout.score.h + 25 },
      frame.age,
      70,
      () => scoreFrame(ctx, layout.score, s),
    );
  if (layout.caption)
    enterLayer(ctx, layout.caption, frame.age, 100, () =>
      captionFrame(ctx, layout.caption, s, scene),
    );
  if (layout.headline) {
    const h = layout.headline,
      left = Number.isFinite(frame.remaining)
        ? Math.max(0, frame.remaining)
        : s.countdownMinutes * 60000;
    const text =
      scene === 'interview'
        ? s.interviewTitle
        : scene === 'countdown'
          ? left > 0
            ? s.countdownTitle
            : s.countdownDone
          : scene === 'inicio'
            ? s.opening
            : scene === 'pausa'
              ? s.pause
              : s.ending;
    const italic = scene !== 'interview',
      rows = lines(ctx, text, h.w, h.size, h.lines, italic);
    rows.forEach((row, i) =>
      enterLayer(
        ctx,
        {
          x: h.x - 8,
          y: h.y - h.size + i * h.size * 1.13,
          w: h.w + 16,
          h: h.size * 1.3,
        },
        frame.age,
        110 + i * 70,
        () =>
          label(
            ctx,
            row,
            h.x,
            h.y + i * h.size * 1.13,
            h.w,
            h.size,
            italic ? 400 : 650,
            'left',
            '#f5f0e6',
            italic,
          ),
      ),
    );
  }
  if (layout.clock) {
    const left = Number.isFinite(frame.remaining)
        ? Math.max(0, frame.remaining)
        : s.countdownMinutes * 60000,
      c = layout.clock,
      p = layout.progress;
    label(
      ctx,
      countdownText(left),
      c.x,
      c.y,
      c.w,
      c.size,
      650,
      'center',
      '#fff',
    );
    ctx.fillStyle = '#ffffff26';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(
      p.x,
      p.y,
      p.w * Math.min(1, left / (s.countdownMinutes * 60000)),
      p.h,
    );
  }
}
