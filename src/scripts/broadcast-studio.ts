import { siteMotion } from '../utils/site-motion.js';
import {
  drawStudio,
  drawStudioBackground,
  countdownText,
  studioSettings,
  cameraRect,
  cameraRects,
  studioScenes,
  studioSize,
  gameRect,
  broadcastLayout,
  profileFor,
  captureSize,
  chatRect,
} from '../utils/broadcast-design.js';
import { browserScene } from '../utils/broadcast-browser-source';
import interFont from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import { createStoredZip } from '../utils/zip-store.js';
import { buildObsCollection, obsUuid } from '../utils/obs-scene-collection.js';
const root = document.querySelector<HTMLElement>('[data-broadcast-studio]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-studio-form]')!;
  const views = Array.from(
    root.querySelectorAll<HTMLElement>('[data-studio-view]'),
  ).map((element) => ({
    element,
    output:
      element.dataset.studioView === 'vertical' ? 'vertical' : 'horizontal',
    preview: element.querySelector<HTMLElement>('[data-studio-preview]')!,
    canvas: element.querySelector<HTMLCanvasElement>('[data-studio-canvas]')!,
  }));
  const previewGroup = root.querySelector<HTMLElement>(
    '[data-studio-previews]',
  )!;
  const activity = root.querySelector<HTMLSelectElement>(
      '[data-studio-activity]',
    )!,
    status = root.querySelector<HTMLElement>('[data-studio-status]')!;
  const pngButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-studio-export]'),
  );
  const htmlButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-studio-html]'),
  );
  const obsButton = root.querySelector<HTMLButtonElement>('[data-studio-obs]')!;
  const downloadButtons = [...pngButtons, ...htmlButtons, obsButton];
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      '[data-studio-field]',
    ),
  );
  const reduced = siteMotion();
  let scene = 'live',
    design = 'arena',
    pending = 0,
    transparent = false,
    exporting = false,
    logo: HTMLImageElement | null = null;
  let currentSettings = studioSettings(),
    inView = true,
    visualTime = 0,
    sceneOpened = performance.now(),
    lastPaint = performance.now();
  let animationTimer: ReturnType<typeof setTimeout> | undefined;
  let countdownDuration = 300000,
    countdownLeft = countdownDuration,
    countdownEnd = 0,
    timerRunning = false;
  const countdownControls = root.querySelector<HTMLElement>(
    '[data-countdown-controls]',
  )!;
  const startTimer = root.querySelector<HTMLButtonElement>(
    '[data-countdown-start]',
  )!;
  const readout = root.querySelector<HTMLOutputElement>(
    '[data-countdown-readout]',
  )!;
  const remaining = () =>
    timerRunning
      ? Math.max(0, countdownEnd - performance.now())
      : countdownLeft;
  const moving = () => root!.dataset.motion === 'on' && !reduced.matches;
  function paint() {
    const now = performance.now();
    if (moving()) visualTime += Math.min(100, Math.max(0, now - lastPaint));
    lastPaint = now;
    const left = remaining();
    if (timerRunning && left === 0) {
      timerRunning = false;
      countdownLeft = 0;
    }
    const frame = {
      time: visualTime,
      age: moving() ? now - sceneOpened : undefined,
      remaining: left,
    };
    for (const view of views)
      drawStudio(
        view.canvas.getContext('2d')!,
        { ...currentSettings, output: view.output },
        scene,
        logo,
        frame,
      );
    const text = countdownText(left);
    if (readout.textContent !== text) readout.textContent = text;
    startTimer.textContent = timerRunning
      ? 'Pausar'
      : left > 0 && left < countdownDuration
        ? 'Continuar'
        : 'Iniciar';
    startTimer.setAttribute('aria-pressed', String(timerRunning));
    if (dialog.open)
      expanded
        .querySelector('canvas')
        ?.getContext('2d')
        ?.drawImage(
          views.find((view) => view.output === expandedOutput)!.canvas,
          0,
          0,
        );
  }
  function refreshAnimation() {
    clearTimeout(animationTimer);
    if (document.hidden || !inView || exporting) return;
    if (moving() || (timerRunning && scene === 'countdown'))
      animationTimer = setTimeout(
        () => {
          paint();
          refreshAnimation();
        },
        moving() ? 50 : 1000,
      );
  }
  function resetTimer() {
    timerRunning = false;
    countdownLeft = countdownDuration;
    paint();
    refreshAnimation();
  }
  startTimer.addEventListener('click', () => {
    if (timerRunning) {
      countdownLeft = remaining();
      timerRunning = false;
    } else {
      if (countdownLeft <= 0) countdownLeft = countdownDuration;
      countdownEnd = performance.now() + countdownLeft;
      timerRunning = true;
    }
    paint();
    refreshAnimation();
  });
  root
    .querySelector('[data-countdown-reset]')!
    .addEventListener('click', resetTimer);
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    root!.dataset.inView = String(inView);
    lastPaint = performance.now();
    if (inView) schedule();
    refreshAnimation();
  });
  observer.observe(previewGroup);
  document.addEventListener('visibilitychange', () => {
    lastPaint = performance.now();
    if (!document.hidden) schedule();
    refreshAnimation();
  });
  window.addEventListener('pageshow', () => {
    observer.observe(previewGroup);
    refreshAnimation();
  });
  const logoLoader = new Image();
  const logoReady = new Promise<boolean>((resolve) => {
    logoLoader.onload = () => {
      logo = logoLoader;
      schedule();
      resolve(true);
    };
    logoLoader.onerror = () => {
      status.textContent =
        'No se ha podido cargar el logo. Recarga la página para exportar.';
      resolve(false);
    };
    logoLoader.src = '/assets/prensa/ugr-lan-party-blanco.svg';
  });
  function values() {
    const input = Object.fromEntries(
      fields.map((field) => [
        field.dataset.studioField!,
        field instanceof HTMLInputElement && field.type === 'checkbox'
          ? field.checked
          : field.value,
      ]),
    );
    return studioSettings({
      ...input,
      design,
      activityId: activity.value,
      activity:
        activity.value === 'personalizada'
          ? input.customActivity
          : activity.selectedOptions[0].textContent,
    });
  }
  function redraw() {
    pending = 0;
    const s = values();
    currentSettings = s;
    const duration = s.countdownMinutes * 60000;
    if (duration !== countdownDuration) {
      countdownDuration = duration;
      timerRunning = scene === 'countdown';
      countdownLeft = duration;
      countdownEnd = performance.now() + duration;
    }
    countdownControls.hidden = scene !== 'countdown';
    for (const view of views) {
      const settings = studioSettings({ ...s, output: view.output }),
        size = studioSize(settings),
        layout = broadcastLayout(settings, scene);
      const { element, preview, canvas } = view;
      if (canvas.width !== size.w || canvas.height !== size.h) {
        canvas.width = size.w;
        canvas.height = size.h;
      }
      preview.dataset.design = s.design;
      function place(
        selector: string,
        rect: { x: number; y: number; w: number; h: number } | null,
      ) {
        const target = element.querySelector<HTMLElement>(selector)!;
        target.hidden = !rect;
        if (rect)
          Object.assign(target.style, {
            inset: 'auto',
            left: `${(rect.x / size.w) * 100}%`,
            top: `${(rect.y / size.h) * 100}%`,
            width: `${(rect.w / size.w) * 100}%`,
            height: `${(rect.h / size.h) * 100}%`,
          });
        return target;
      }
      place('[data-studio-image]', layout.game);
      place('[data-studio-placeholder]', layout.game);
      place('[data-studio-chat-demo]', layout.chat);
      ['[data-studio-camera-demo]', '[data-studio-camera-demo-second]'].forEach(
        (selector, index) => {
          const rect = layout.cameras[index],
            target = place(selector, rect || null);
          if (rect) {
            const cut = Math.min(18, rect.h / 4),
              radius = s.design === 'glass' ? 22 : 5;
            target.style.clipPath =
              s.design === 'arena'
                ? `polygon(${(cut / rect.w) * 100}% 0,100% 0,100% ${100 - (cut / rect.h) * 100}%,${100 - (cut / rect.w) * 100}% 100%,0 100%,0 ${(cut / rect.h) * 100}%)`
                : `inset(0 round ${(radius / rect.w) * 100}% / ${(radius / rect.h) * 100}%)`;
          }
        },
      );
      element.querySelector<HTMLElement>(
        '[data-studio-game-label]',
      )!.textContent = s.activity;
      preview.dataset.transparent = String(transparent && scene !== 'final');
      canvas.setAttribute(
        'aria-label',
        `${view.output}: ${s.activity}. ${s.teamA} ${s.scoreA}, ${s.teamB} ${s.scoreB}. ${s.webcamLabel}. ${['dual', 'interview'].includes(scene) ? s.webcamLabel2 : ''}. ${s.eyebrow}: ${s.title}`,
      );
    }
    root!.querySelector<HTMLElement>(
      '[data-studio-profile-note]',
    )!.textContent = profileFor(s).note;
    root!.querySelector<HTMLElement>(
      '[data-studio-preview-label]',
    )!.textContent =
      `Ambos formatos · ${{ live: 'Directo', webcam: 'Webcam', dual: 'Doble webcam', interview: 'Entrevista', countdown: 'Cuenta atrás', rotulo: 'Rótulo', marcador: 'Marcador', inicio: 'Inicio', pausa: 'Pausa', final: 'Cierre' }[scene]}`;
    root!.querySelector<HTMLElement>('[data-studio-custom-name]')!.hidden =
      activity.value !== 'personalizada';
    paint();
    refreshAnimation();
    updateExpanded();
  }
  function schedule() {
    if (!pending) pending = requestAnimationFrame(redraw);
  }
  const animate = () => {
    sceneOpened = performance.now();
    schedule();
  };
  function selectActivity(updateUrl = true) {
    const recommendation = profileFor({ activityId: activity.value });
    const labels: Record<string, [string, string]> = {
      f1: ['Mejor vuelta', 'Contrarreloj'],
      cars: ['Mejor vuelta', 'Copa Pistón'],
      tetris: ['Mejor puntuación', 'Reto de puntuación'],
      'beat-saber': ['Mejor puntuación', 'Reto de ritmo'],
      'wii-sports-bolos': ['Mejor serie', 'Ronda de bolos'],
      hacking: ['Puntos', 'Reto técnico'],
      retro: ['Mejor marca', 'Reto retro'],
    };
    const rounds: Record<string, string> = {
      ajedrez: 'Partida',
      minecraft: 'Ronda',
      'mario-kart': 'Manga',
      'league-of-legends': 'Partida / Serie',
      'rocket-league': 'Partida / Serie',
      'wii-sports-tenis': 'Partido',
      smash: 'Sets',
      'brawl-stars': 'Serie',
      'clash-royale': 'Partida / Serie',
      '2XKO': 'Sets',
      futbolin: 'Partida',
      'ping-pong': 'Sets',
      'street-fighter': 'Sets',
      tcg: 'Ronda',
    };
    form.querySelector<HTMLInputElement>('[data-studio-field="round"]')!.value =
      labels[activity.value]?.[1] ||
      rounds[activity.value] ||
      'ULP · En directo';
    form.querySelector<HTMLInputElement>(
      '[data-studio-field="resultLabel"]',
    )!.value = labels[activity.value]?.[0] || 'Mejor marca';

    form.querySelector<HTMLInputElement>(
      '[data-studio-field="scoreboard"]',
    )!.checked = recommendation.mode !== 'off';
    form.querySelector<HTMLSelectElement>(
      '[data-studio-field="captureRatio"]',
    )!.value = 'auto';
    const source = activity.selectedOptions[0].dataset.image;
    for (const view of views) {
      const image = view.element.querySelector<HTMLImageElement>(
        '[data-studio-image]',
      )!;
      image.onerror = () => {
        image.onerror = null;
        image.src = '/assets/about/sobre-nosotros.png';
      };
      image.src =
        source && source.startsWith('/assets/')
          ? source
          : '/assets/about/sobre-nosotros.png';
    }
    if (updateUrl) history.replaceState(null, '', `#${activity.value}`);
    schedule();
    animate();
  }
  function readHash() {
    const hash = location.hash.slice(1);
    if (hash.startsWith('archive-')) return;
    const id = hash === 'lol' ? 'league-of-legends' : hash;
    activity.value = Array.from(activity.options).some((o) => o.value === id)
      ? id
      : 'general';
    selectActivity(false);
  }
  const programPreset = root.querySelector<HTMLSelectElement>(
    '[data-studio-program-preset]',
  )!;
  const programNote = root.querySelector<HTMLElement>(
    '[data-studio-program-note]',
  )!;
  programPreset.addEventListener('change', () => {
    const presets: Record<
      string,
      {
        activity: string;
        scene: string;
        webcam: boolean;
        chat: boolean;
        name: string;
        note: string;
      }
    > = {
      mesa: {
        activity: 'general',
        scene: 'webcam',
        webcam: true,
        chat: true,
        name: 'Mesa de casters',
        note: 'Plano de la mesa y chat lateral. Usa Doble webcam para dos señales separadas o Entrevista para dos participantes y chat.',
      },
      lol: {
        activity: 'league-of-legends',
        scene: 'live',
        webcam: true,
        chat: false,
        name: 'Casters · League of Legends',
        note: 'Captura del espectador y cámara de casters. Las cámaras de equipo de la escaleta se pueden componer dentro de Tu webcam en OBS.',
      },
      rocket: {
        activity: 'rocket-league',
        scene: 'live',
        webcam: true,
        chat: false,
        name: 'Casters · Rocket League',
        note: 'Partida completa y casters: el marcador de la serie queda fuera del HUD del juego.',
      },
      minecraft: {
        activity: 'minecraft',
        scene: 'live',
        webcam: true,
        chat: false,
        name: 'Jugador · Minecraft',
        note: 'Captura del jugador para UHC o Hunger Games y una webcam independiente.',
      },
      irl: {
        activity: 'general',
        scene: 'webcam',
        webcam: true,
        chat: false,
        name: 'En la ETSIIT · IRL',
        note: 'Cámara principal ampliada para stands, StreetPass, público o Paella Cam. Añade la señal móvil o VDO.Ninja en Tu webcam; no se conecta automáticamente.',
      },
      acto: {
        activity: 'general',
        scene: 'webcam',
        webcam: true,
        chat: false,
        name: 'Salón de actos',
        note: 'Plano amplio del escenario para bienvenida, charlas, concierto o entrega de premios. El chat queda oculto para dar prioridad al acto.',
      },
      video: {
        activity: 'general',
        scene: 'live',
        webcam: false,
        chat: false,
        name: 'Vídeo',
        note: 'Captura limpia sin webcam ni marcador. Añade el vídeo de presentación o colaborador en Tu juego; se conserva su proporción.',
      },
    };
    const preset = presets[programPreset.value];
    programNote.hidden = !preset;
    if (!preset) return;
    activity.value = preset.activity;
    selectActivity();
    for (const [key, value] of Object.entries({
      webcam: preset.webcam,
      chat: preset.chat,
      webcamLabel: preset.name,
    })) {
      const field = form.querySelector<HTMLInputElement>(
        `[data-studio-field="${key}"]`,
      )!;
      if (typeof value === 'boolean') field.checked = value;
      else field.value = value;
    }
    programNote.textContent = preset.note;
    root!
      .querySelector<HTMLButtonElement>(
        `[data-studio-scene="${preset.scene}"]`,
      )!
      .click();
    schedule();
  });
  activity.addEventListener('change', () => {
    programPreset.value = '';
    programNote.hidden = true;
    selectActivity();
  });
  window.addEventListener('hashchange', readHash);
  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  fields.forEach((field) =>
    field.addEventListener('blur', () => {
      if (field instanceof HTMLInputElement && field.type !== 'checkbox') {
        const key = field.dataset.studioField as keyof ReturnType<
          typeof studioSettings
        >;
        const value = values()[key];
        if (typeof value === 'string' || typeof value === 'number')
          field.value = String(value);
      }
    }),
  );
  root
    .querySelectorAll<HTMLButtonElement>('[data-studio-scene]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        const next = button.dataset.studioScene!;
        if (!studioScenes.includes(next)) return;
        const enteringCountdown = next === 'countdown' && scene !== next;
        scene = next;
        if (enteringCountdown) {
          if (countdownLeft <= 0) countdownLeft = countdownDuration;
          countdownEnd = performance.now() + countdownLeft;
          timerRunning = true;
        }
        if (scene === 'countdown')
          root!.querySelector<HTMLDetailsElement>(
            '[data-countdown-settings]',
          )!.open = true;
        root
          .querySelectorAll('[data-studio-scene]')
          .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        schedule();
        animate();
      }),
    );
  root
    .querySelectorAll<HTMLButtonElement>('[data-studio-design]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        design = button.dataset.studioDesign!;
        root
          .querySelectorAll('[data-studio-design]')
          .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        schedule();
        animate();
      }),
    );
  root
    .querySelector('[data-studio-transparent]')!
    .addEventListener('click', (event) => {
      transparent = !transparent;
      (event.currentTarget as HTMLElement).setAttribute(
        'aria-pressed',
        String(transparent),
      );
      schedule();
    });
  const motion = root.querySelector<HTMLButtonElement>('[data-studio-motion]')!;
  function setMotion(enabled: boolean) {
    root!.dataset.motion = enabled ? 'on' : 'off';
    motion.setAttribute('aria-pressed', String(enabled));
    motion.setAttribute(
      'aria-label',
      enabled ? 'Pausar animación' : 'Activar animación',
    );
    motion.textContent = enabled ? 'Ⅱ' : '▷';
    schedule();
    refreshAnimation();
  }
  setMotion(!reduced.matches);
  reduced.addEventListener('change', () => setMotion(!reduced.matches));
  motion.addEventListener('click', () => {
    setMotion(root!.dataset.motion !== 'on');
    if (pending) cancelAnimationFrame(pending);
    redraw();
  });
  form.addEventListener('reset', () =>
    requestAnimationFrame(() => {
      scene = 'live';
      design = 'arena';
      transparent = false;
      programPreset.value = '';
      programNote.hidden = true;
      countdownDuration = 300000;
      countdownLeft = countdownDuration;
      timerRunning = false;
      visualTime = 0;
      status.textContent = '';
      root!
        .querySelectorAll('[data-studio-design]')
        .forEach((b) =>
          b.setAttribute(
            'aria-pressed',
            String((b as HTMLElement).dataset.studioDesign === 'arena'),
          ),
        );
      root!
        .querySelectorAll('[data-studio-scene]')
        .forEach((b) =>
          b.setAttribute(
            'aria-pressed',
            String((b as HTMLElement).dataset.studioScene === 'live'),
          ),
        );
      root!
        .querySelector('[data-studio-transparent]')!
        .setAttribute('aria-pressed', 'false');
      selectActivity();
    }),
  );
  const dialog = root.querySelector<HTMLDialogElement>('[data-studio-dialog]')!,
    expanded = root.querySelector<HTMLElement>('[data-studio-expanded]')!;
  let previousOverflow = '';
  let expandedOutput = 'horizontal';
  let expand: HTMLButtonElement | undefined;
  function updateExpanded() {
    if (!dialog.open) return;
    const view = views.find((view) => view.output === expandedOutput)!;
    const copy = view.preview.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
    const target = copy.querySelector('canvas')!;
    target.getContext('2d')!.drawImage(view.canvas, 0, 0);
    expanded.replaceChildren(copy);
  }
  root
    .querySelectorAll<HTMLButtonElement>('[data-studio-expand]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        expand = button;
        expandedOutput = button.dataset.output!;
        previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        dialog.showModal();
        updateExpanded();
        root!.querySelector<HTMLButtonElement>('[data-studio-close]')!.focus();
      }),
    );
  root
    .querySelector('[data-studio-close]')!
    .addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    expanded.replaceChildren();
    expand?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const b = dialog.getBoundingClientRect();
      if (
        e.clientX < b.left ||
        e.clientX > b.right ||
        e.clientY < b.top ||
        e.clientY > b.bottom
      )
        dialog.close();
    }
  });
  async function makePng(
    settings: ReturnType<typeof studioSettings>,
    kind: string,
    countdownRemaining?: number,
  ) {
    const out = document.createElement('canvas');
    const size = studioSize(settings);
    out.width = size.w;
    out.height = size.h;
    drawStudio(out.getContext('2d')!, settings, kind, logo, {
      remaining: countdownRemaining,
    });
    const blob = await new Promise<Blob>((resolve, reject) =>
      out.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('PNG indisponible'))),
        'image/png',
      ),
    );
    out.width = 1;
    return blob;
  }
  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  let assetPromise: Promise<{ logo: string; font: string }> | undefined;
  async function asData(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Recurso indisponible');
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  function browserAssets() {
    return (assetPromise ??= Promise.all([
      asData('/assets/prensa/ugr-lan-party-blanco.svg'),
      asData(interFont),
    ])
      .then(([logo, font]) => ({ logo, font }))
      .catch((error) => {
        assetPromise = undefined;
        throw error;
      }));
  }
  async function runExport(obs: boolean, html = false, output = 'horizontal') {
    if (obsButton.disabled) return;
    exporting = true;
    clearTimeout(animationTimer);
    downloadButtons.forEach((button) => (button.disabled = true));
    form.setAttribute('aria-busy', 'true');
    status.textContent = obs
      ? 'Preparando tus escenas…'
      : html
        ? 'Preparando tu escena…'
        : 'Preparando tu PNG…';
    if (pending) {
      cancelAnimationFrame(pending);
      redraw();
    }
    const s = studioSettings({ ...currentSettings, output }),
      id = activity.value,
      selectedScene = scene,
      remainingSnapshot = remaining();
    try {
      if (!(await logoReady)) throw new Error('Logo indisponible');
      await document.fonts.load('650 32px "Inter Variable"');
      if (html) {
        const source = browserScene(
          s,
          selectedScene,
          await browserAssets(),
          moving(),
        );
        download(
          new Blob([source], { type: 'text/html;charset=utf-8' }),
          `ulp-${id}-${selectedScene}-${s.output}.html`,
        );
        status.textContent =
          'Escena HTML lista: añádela como fuente Navegador local en OBS.';
      } else if (!obs) {
        download(
          await makePng(s, selectedScene, remainingSnapshot),
          `ulp-${id}-${selectedScene}-${studioSize(s).w}x${studioSize(s).h}.png`,
        );
        status.textContent = 'PNG listo. Descarga iniciada.';
      } else {
        const encoder = new TextEncoder();
        const both = true;
        const exports: { name: string; bytes: Uint8Array }[] = [];
        const formats = both ? ['horizontal', 'vertical'] : [s.output];
        for (const output of formats) {
          const settings = studioSettings({ ...s, output });
          const size = studioSize(settings);
          const collection = buildObsCollection(s.activity, true);
          collection.name = `ULP Studio · ${s.activity} · ${output === 'vertical' ? 'Vertical' : 'Horizontal'}`;
          collection.resolution = { x: size.w, y: size.h };
          for (const source of collection.sources)
            if (source.id === 'scene') {
              Object.assign(source.settings, {
                custom_size: true,
                cx: size.w,
                cy: size.h,
              });
              for (const item of source.settings.items)
                item.bounds = { x: size.w, y: size.h };
            }
          Object.assign(
            collection.sources.find((source) => source.name === 'Tu juego')!
              .settings,
            { cx: captureSize(settings).w, cy: captureSize(settings).h },
          );
          const game = gameRect(settings);
          const gameItem = collection.sources
            .find((source) => source.name === 'Partida')!
            .settings.items.find(
              (item: { name: string }) => item.name === 'Tu juego',
            )!;
          gameItem.pos = { x: game.x, y: game.y };
          gameItem.bounds = { x: game.w, y: game.h };
          const entries = [
            { name: 'coleccion-ulp.json', bytes: new Uint8Array() },
            {
              name: 'IMPORTAR-EN-OBS.txt',
              bytes: encoder.encode(
                `ULP BROADCAST STUDIO

1. Descomprime todo el ZIP en una carpeta permanente.
2. En OBS: Colección de escenas > Importar. Elige coleccion-ulp.json.
3. Selecciona la colección ULP Studio. Inicio, Partida, Webcam, Pausa y Final usan tu diseño.
4. Añade tu captura en Tu juego, las cámaras en Tu webcam y Tu webcam 2, y tu widget de chat en Tu chat. Ajusta cada una al lienzo de su escena. Doble webcam muestra ambas con sus nombres.
5. Comprueba tu audio y configura el lienzo de ${size.w} × ${size.h}.
${output === 'vertical' ? 'La captura Tu juego conserva su proporción dentro de la mitad superior. La cámara, el logo y el marcador quedan debajo.' : ''}

El pack multistream contiene dos colecciones independientes con los mismos textos. El chat se reserva en inicio, pausa, cuenta atrás, webcam y entrevista. Los mensajes de ejemplo no se exportan; añade tu propio widget. No se conectan chats automáticamente.
Importar escenas no configura dos emisiones simultáneas. Configura las salidas horizontal y vertical en tu herramienta de emisión; comprueba ambos encuadres y la interfaz de TikTok antes de salir en directo.

Si hay archivos ausentes, selecciona la carpeta recursos del pack.
Las fuentes Navegador locales conservan las animaciones y arrancan la cuenta atrás al cargarse. Para reiniciar la cuenta atrás, actualiza esa fuente. El pack también guarda los PNG estáticos como alternativa. Para actualizar textos o marcadores, descarga otro pack desde el editor.
Las escenas Webcam, Doble webcam y sus dos cámaras solo se incluyen cuando el marco de cámara está activado.
`,
              ),
            },
          ];
          const bg = document.createElement('canvas');
          bg.width = size.w;
          bg.height = size.h;
          const bc = bg.getContext('2d')!;
          drawStudioBackground(bc, size.w, size.h);
          const bgBlob = await new Promise<Blob>((resolve) =>
            bg.toBlob((b) => resolve(b!), 'image/png'),
          );
          entries.push({
            name: 'recursos/fondo.png',
            bytes: new Uint8Array(await bgBlob.arrayBuffer()),
          });
          bg.width = 1;
          for (const [file, kind] of [
            ['overlay', 'live'],
            ['inicio', 'inicio'],
            ['pausa', 'pausa'],
            ['final', 'final'],
            ['webcam', 'webcam'],
            ['doble-webcam', 'dual'],
            ['cuenta-atras', 'countdown'],
            ['entrevista', 'interview'],
          ])
            entries.push({
              name: `recursos/${file}.png`,
              bytes: new Uint8Array(
                await (await makePng(settings, kind)).arrayBuffer(),
              ),
            });
          if (s.webcam) {
            const cameraSource = structuredClone(
              collection.sources.find((source) => source.name === 'Tu juego')!,
            );
            cameraSource.name = 'Tu webcam';
            cameraSource.uuid = obsUuid();
            const rect = cameraRect(settings);
            Object.assign(cameraSource.settings, {
              custom_size: true,
              cx: rect.w,
              cy: rect.h,
            });
            collection.sources.push(cameraSource);
            const live = collection.sources.find(
              (source) => source.name === 'Partida',
            )!;
            const template = structuredClone(live.settings.items[1]);
            Object.assign(template, {
              name: cameraSource.name,
              source_uuid: cameraSource.uuid,
              id: 4,
              pos: { x: rect.x, y: rect.y },
              bounds: { x: rect.w, y: rect.h },
            });
            live.settings.items.splice(
              live.settings.items.length - 1,
              0,
              template,
            );
            live.settings.id_counter = 4;
            const webcamImage = structuredClone(
              collection.sources.find(
                (source) => source.name === 'ULP · Overlay personalizado',
              )!,
            );
            webcamImage.name = 'ULP · Webcam';
            webcamImage.uuid = obsUuid();
            webcamImage.settings.file = './recursos/webcam.png';
            const webcamScene = structuredClone(live);
            webcamScene.name = 'Webcam';
            webcamScene.uuid = obsUuid();
            const large = cameraRect(settings, 'webcam');
            const largeCamera = structuredClone(template);
            Object.assign(largeCamera, {
              id: 1,
              pos: { x: large.x, y: large.y },
              bounds: { x: large.w, y: large.h },
            });
            const webcamFrame = structuredClone(live.settings.items.at(-1)!);
            Object.assign(webcamFrame, {
              name: webcamImage.name,
              source_uuid: webcamImage.uuid,
              id: 2,
            });
            const webcamBackground = structuredClone(live.settings.items[0]);
            webcamBackground.id = 1;
            largeCamera.id = 2;
            webcamFrame.id = 3;
            webcamScene.settings.items = [
              webcamBackground,
              largeCamera,
              webcamFrame,
            ];
            webcamScene.settings.id_counter = 3;
            collection.sources.push(webcamImage, webcamScene);
            collection.scene_order.splice(2, 0, { name: 'Webcam' });
            collection.scene_order.push({ name: cameraSource.name });
            const dualRects = cameraRects(settings, 'dual');
            const camera2 = structuredClone(cameraSource);
            camera2.name = 'Tu webcam 2';
            camera2.uuid = obsUuid();
            Object.assign(camera2.settings, {
              cx: dualRects[1].w,
              cy: dualRects[1].h,
            });
            const dualImage = structuredClone(webcamImage);
            dualImage.name = 'ULP · Doble webcam';
            dualImage.uuid = obsUuid();
            dualImage.settings.file = './recursos/doble-webcam.png';
            const dualScene = structuredClone(webcamScene);
            dualScene.name = 'Doble webcam';
            dualScene.uuid = obsUuid();
            const cameras = dualRects.map((rect, index) => ({
              ...structuredClone(largeCamera),
              id: index + 2,
              name: index ? camera2.name : cameraSource.name,
              source_uuid: index ? camera2.uuid : cameraSource.uuid,
              pos: { x: rect.x, y: rect.y },
              bounds: { x: rect.w, y: rect.h },
            }));
            dualScene.settings.items = [
              structuredClone(webcamBackground),
              ...cameras,
              {
                ...structuredClone(webcamFrame),
                id: 4,
                name: dualImage.name,
                source_uuid: dualImage.uuid,
              },
            ];
            dualScene.settings.id_counter = 4;
            collection.sources.push(camera2, dualImage, dualScene);
            collection.scene_order.splice(3, 0, { name: dualScene.name });
            collection.scene_order.push({ name: camera2.name });
          }
          const interviewImage = structuredClone(
            collection.sources.find(
              (source) => source.name === 'ULP · Overlay personalizado',
            )!,
          );
          interviewImage.name = 'ULP · Entrevista';
          interviewImage.uuid = obsUuid();
          interviewImage.settings.file = './recursos/entrevista.png';
          const interviewScene = structuredClone(
            collection.sources.find((source) => source.name === 'Inicio')!,
          );
          interviewScene.name = 'Entrevista';
          interviewScene.uuid = obsUuid();
          const interviewFrame = interviewScene.settings.items.at(-1)!;
          interviewFrame.name = interviewImage.name;
          interviewFrame.source_uuid = interviewImage.uuid;
          if (settings.webcam)
            cameraRects(settings, 'interview').forEach((rect, index) => {
              const source = collection.sources.find(
                (source) =>
                  source.name === (index ? 'Tu webcam 2' : 'Tu webcam'),
              )!;
              const item = {
                ...structuredClone(gameItem),
                name: source.name,
                source_uuid: source.uuid,
                id: index + 3,
                pos: { x: rect.x, y: rect.y },
                bounds: { x: rect.w, y: rect.h },
              };
              interviewScene.settings.items.splice(
                interviewScene.settings.items.length - 1,
                0,
                item,
              );
            });
          interviewScene.settings.id_counter = 4;
          collection.sources.push(interviewImage, interviewScene);
          collection.scene_order.splice(4, 0, { name: interviewScene.name });
          const assets = await browserAssets();
          const kinds: Record<string, string> = {
            overlay: 'live',
            inicio: 'inicio',
            pausa: 'pausa',
            final: 'final',
            webcam: 'webcam',
            'doble-webcam': 'dual',
            entrevista: 'interview',
          };
          for (const source of collection.sources.filter(
            (source) =>
              source.id === 'image_source' && source.name !== 'ULP · Fondo',
          )) {
            const filename = source.settings.file
              .split('/')
              .at(-1)!
              .replace('.png', '');
            source.id = source.versioned_id = 'browser_source';
            source.settings = {
              is_local_file: true,
              local_file: `./recursos/${filename}.html`,
              width: size.w,
              height: size.h,
              fps: 20,
              fps_custom: true,
              shutdown: true,
              restart_when_active: true,
              css: 'body {margin:0;background:transparent;overflow:hidden;}',
            };
          }
          for (const [file, kind] of Object.entries({
            ...kinds,
            'cuenta-atras': 'countdown',
          }))
            entries.push({
              name: `recursos/${file}.html`,
              bytes: encoder.encode(
                browserScene(settings, kind, assets, moving()),
              ),
            });
          const countdownScene = structuredClone(
            collection.sources.find((source) => source.name === 'Inicio')!,
          );
          countdownScene.name = 'Cuenta atrás';
          countdownScene.uuid = obsUuid();
          const countdownSource = structuredClone(
            collection.sources.find(
              (source) => source.name === 'ULP · Inicio',
            )!,
          );
          countdownSource.name = 'ULP · Cuenta atrás';
          countdownSource.uuid = obsUuid();
          countdownSource.settings.local_file = './recursos/cuenta-atras.html';
          const countdownItem = countdownScene.settings.items.at(-1)!;
          countdownItem.name = countdownSource.name;
          countdownItem.source_uuid = countdownSource.uuid;
          collection.sources.push(countdownSource, countdownScene);
          collection.scene_order.splice(1, 0, { name: countdownScene.name });
          if (settings.chat) {
            const chatSource = structuredClone(
              collection.sources.find((source) => source.name === 'Tu juego')!,
            );
            chatSource.name = 'Tu chat';
            chatSource.uuid = obsUuid();
            Object.assign(chatSource.settings, {
              cx: output === 'vertical' ? 848 : 480,
              cy: output === 'vertical' ? 424 : 720,
              items: [],
            });
            collection.sources.push(chatSource);
            collection.scene_order.push({ name: chatSource.name });
            const chatScenes: Record<string, string> = {
              Inicio: 'inicio',
              Pausa: 'pausa',
              'Cuenta atrás': 'countdown',
              Webcam: 'webcam',
              Entrevista: 'interview',
            };
            for (const name of Object.keys(chatScenes)) {
              const target = collection.sources.find(
                (source) => source.name === name,
              );
              const rect = chatRect(settings, chatScenes[name]);
              if (!target || !rect) continue;
              const next =
                Math.max(
                  ...target.settings.items.map(
                    (item: { id: number }) => item.id,
                  ),
                ) + 1;
              const item = {
                ...structuredClone(gameItem),
                name: chatSource.name,
                source_uuid: chatSource.uuid,
                id: next,
                pos: { x: rect.x, y: rect.y },
                bounds: { x: rect.w, y: rect.h },
              };
              target.settings.items.splice(
                target.settings.items.length - 1,
                0,
                item,
              );
              target.settings.id_counter = next;
            }
          }
          entries[0].bytes = encoder.encode(
            JSON.stringify(collection, null, 2),
          );
          exports.push(
            ...entries.map((entry) => ({
              ...entry,
              name: both ? `${output}/${entry.name}` : entry.name,
            })),
          );
        }
        download(
          createStoredZip(exports),
          `ulp-studio-obs-${id}${both ? '-multistream' : '-' + s.output}.zip`,
        );
        status.textContent =
          'Pack OBS listo. Descomprime el ZIP e importa la colección del formato que quieras usar.';
      }
    } catch {
      status.textContent =
        'No se ha podido crear la descarga. Vuelve a intentarlo.';
    } finally {
      downloadButtons.forEach((button) => (button.disabled = false));
      form.removeAttribute('aria-busy');
      exporting = false;
      lastPaint = performance.now();
      refreshAnimation();
    }
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    void runExport(false);
  });
  obsButton.addEventListener('click', () => void runExport(true));
  pngButtons.forEach((button) =>
    button.addEventListener(
      'click',
      () => void runExport(false, false, button.dataset.output),
    ),
  );
  htmlButtons.forEach((button) =>
    button.addEventListener(
      'click',
      () => void runExport(false, true, button.dataset.output),
    ),
  );
  window.addEventListener('pagehide', () => {
    clearTimeout(animationTimer);
    observer.disconnect();
    cancelAnimationFrame(pending);
    pending = 0;
    if (dialog.open) dialog.close();
  });
  readHash();
  void document.fonts.ready.then(schedule);
}
