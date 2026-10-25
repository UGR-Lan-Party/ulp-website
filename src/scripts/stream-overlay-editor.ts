import { drawOverlay, overlaySettings } from '../utils/overlay-customizer.js';
const frames = new Map<string, Promise<HTMLCanvasElement>>();
function loadFrame(source: string) {
  let promise = frames.get(source);
  if (!promise) {
    const image = new Image();
    image.decoding = 'async';
    image.src = source;
    promise = image.decode().then(() => {
      const frame = document.createElement('canvas');
      frame.width = 1920;
      frame.height = 1080;
      const ctx = frame.getContext('2d')!;
      ctx.drawImage(image, 0, 0, 1920, 1080);
      const pixels = ctx.getImageData(0, 0, 1920, 1080);
      // Remove the near-transparent raster residue without changing the original download.
      for (let i = 3; i < pixels.data.length; i += 4)
        if (pixels.data[i] < 16) pixels.data[i] = 0;
      ctx.putImageData(pixels, 0, 0);
      return frame;
    });
    frames.set(source, promise);
    promise.catch(() => frames.delete(source));
  }
  return promise;
}
async function createOverlayPng(
  settings: ReturnType<typeof overlaySettings>,
  includeFrame: boolean,
  frameSource: string,
) {
  await document.fonts.load('650 27px "Inter Variable"');
  const output = document.createElement('canvas');
  output.width = 1920;
  output.height = 1080;
  const ctx = output.getContext('2d')!;
  if (includeFrame)
    ctx.drawImage(await loadFrame(frameSource), 0, 0, 1920, 1080);
  const layer = document.createElement('canvas');
  layer.width = 1920;
  layer.height = 1080;
  drawOverlay(layer.getContext('2d')!, settings);
  ctx.drawImage(layer, 0, 0);
  layer.width = 1;
  const blob = await new Promise<Blob>((resolve, reject) =>
    output.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('PNG no disponible'))),
      'image/png',
    ),
  );
  output.width = 1;
  return blob;
}

document
  .querySelectorAll<HTMLElement>('[data-stream-profile]')
  .forEach((profile) => {
    const wrapper = profile.querySelector<HTMLElement>(
      '[data-overlay-customizer]',
    )!;
    const form = wrapper.querySelector<HTMLFormElement>('[data-overlay-form]')!;
    const toggle = wrapper.querySelector<HTMLButtonElement>(
      '[data-overlay-toggle]',
    )!;
    toggle.hidden = false;
    const stage = profile.querySelector<HTMLElement>('[data-stream-stage]')!;
    const status = form.querySelector<HTMLElement>('[data-overlay-status]')!;
    const exportButton = form.querySelector<HTMLButtonElement>(
      '[data-overlay-export]',
    )!;
    const obsButton =
      form.querySelector<HTMLButtonElement>('[data-overlay-obs]')!;
    const inputs = Array.from(
      form.querySelectorAll<HTMLInputElement>('[data-overlay-field]'),
    );
    const frameCheckbox = form.querySelector<HTMLInputElement>(
      '[data-overlay-frame]',
    )!;
    const frameImage = stage.querySelector<HTMLImageElement>(
      '[data-kind=overlay]',
    )!;
    let canvas: HTMLCanvasElement | null = null,
      pending = 0;
    const values = () =>
      overlaySettings({
        ...Object.fromEntries(
          inputs.map((input) => [input.dataset.overlayField!, input.value]),
        ),
        mode: form.querySelector<HTMLInputElement>(
          '[data-overlay-mode]:checked',
        )?.value,
      });
    function redraw() {
      pending = 0;
      if (!canvas || form.hidden) return;
      const settings = values();
      drawOverlay(canvas.getContext('2d')!, settings);
      canvas.setAttribute(
        'aria-label',
        `Overlay de ${profile.dataset.profileName}: ${settings.teamA} ${settings.scoreA}, ${settings.teamB} ${settings.scoreB}. ${settings.caption}: ${settings.player}`,
      );
      form.querySelector<HTMLElement>('[data-overlay-teams]')!.hidden =
        settings.mode === 'caption';
      form.querySelector<HTMLElement>('[data-overlay-caption-fields]')!.hidden =
        settings.mode === 'scoreboard';
      const baseInput = Array.from(
        profile.querySelectorAll<HTMLInputElement>('[data-stream-layer]'),
      ).find((input) => input.dataset.streamLayer === frameImage.dataset.layer);
      if (baseInput) baseInput.checked = frameCheckbox.checked;
      profile.dataset.customFrame = String(frameCheckbox.checked);
      profile.dispatchEvent(new Event('overlay-preview-change'));
    }
    const schedule = () => {
      if (!pending) pending = requestAnimationFrame(redraw);
    };
    toggle.addEventListener('click', () => {
      const open = form.hidden;
      form.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('[data-overlay-toggle-label]')!.textContent = open
        ? 'Cerrar personalización'
        : 'Personalizar overlay';
      profile.dataset.customOverlay = String(open);
      if (open) {
        frameCheckbox.checked = !frameImage.hidden;
        canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        canvas.className = 'stream-custom-overlay';
        canvas.setAttribute('role', 'img');
        stage.append(canvas);
        redraw();
        void document.fonts.load('650 27px "Inter Variable"').then(schedule);
      } else {
        cancelAnimationFrame(pending);
        pending = 0;
        canvas?.remove();
        if (canvas) canvas.width = 1;
        canvas = null;
        profile.dispatchEvent(new Event('overlay-preview-change'));
      }
    });
    profile
      .querySelectorAll<HTMLInputElement>('[data-stream-layer]')
      .forEach((input) =>
        input.addEventListener('change', () => {
          if (input.dataset.streamLayer === frameImage.dataset.layer) {
            frameCheckbox.checked = input.checked;
            schedule();
          }
        }),
      );
    form.addEventListener('input', schedule);
    form.addEventListener('change', schedule);
    inputs.forEach((input) =>
      input.addEventListener('blur', () => {
        const settings = values();
        input.value = String(
          settings[input.dataset.overlayField as keyof typeof settings],
        );
        schedule();
      }),
    );
    form.addEventListener('reset', () => {
      status.textContent = '';
      requestAnimationFrame(redraw);
    });
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!canvas || exportButton.disabled) return;
      exportButton.disabled = true;
      obsButton.disabled = true;
      form.setAttribute('aria-busy', 'true');
      status.textContent = 'Preparando PNG…';
      const snapshot = values(),
        includeFrame = frameCheckbox.checked;
      try {
        const blob = await createOverlayPng(
          snapshot,
          includeFrame,
          frameImage.dataset.original!,
        );
        const url = URL.createObjectURL(blob),
          link = document.createElement('a');
        link.href = url;
        link.download = `ulp-overlay-${profile.dataset.streamProfile}-1920x1080.png`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        status.textContent = 'PNG listo. Se ha iniciado la descarga.';
      } catch {
        status.textContent =
          'No se ha podido crear el PNG. Vuelve a intentarlo.';
      } finally {
        exportButton.disabled = false;
        obsButton.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
    obsButton.addEventListener('click', async () => {
      if (!canvas || obsButton.disabled) return;
      obsButton.disabled = exportButton.disabled = true;
      form.setAttribute('aria-busy', 'true');
      status.textContent = 'Preparando escenas para OBS…';
      const snapshot = values(),
        includeFrame = frameCheckbox.checked;
      const background =
        stage.querySelector<HTMLImageElement>('[data-kind=fondo]')!;
      const backgroundInput = Array.from(
        profile.querySelectorAll<HTMLInputElement>('[data-stream-layer]'),
      ).find((input) => input.dataset.streamLayer === background.dataset.layer);
      try {
        const overlay = await createOverlayPng(
          snapshot,
          includeFrame,
          frameImage.dataset.original!,
        );
        const { createObsScenePack } = await import('./obs-scene-export');
        const blob = await createObsScenePack({
          profileName: profile.dataset.profileName!,
          settings: snapshot,
          overlay,
          background: background.dataset.original!,
          includeBackground: backgroundInput?.checked ?? true,
        });
        const url = URL.createObjectURL(blob),
          link = document.createElement('a');
        link.href = url;
        link.download = `ulp-obs-${profile.dataset.streamProfile}-2026.zip`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        status.textContent =
          'Pack OBS listo. Descomprime el ZIP e importa coleccion-ulp.json.';
      } catch {
        status.textContent =
          'No se ha podido crear el pack OBS. Vuelve a intentarlo.';
      } finally {
        obsButton.disabled = exportButton.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
    window.addEventListener('pagehide', () => {
      cancelAnimationFrame(pending);
      pending = 0;
      if (canvas) canvas.width = 1;
    });
    window.addEventListener('pageshow', (event) => {
      if (event.persisted && canvas && !form.hidden) {
        canvas.width = 1920;
        canvas.height = 1080;
        redraw();
      }
    });
  });
