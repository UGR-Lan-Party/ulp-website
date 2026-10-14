document.querySelectorAll<HTMLElement>('.trophy-viewer').forEach((viewer) => {
  const open = viewer.querySelector<HTMLButtonElement>('[data-trophy-open]')!;
  const close = viewer.querySelector<HTMLButtonElement>('[data-trophy-close]')!;
  const preview = viewer.querySelector<HTMLImageElement>(
    '[data-trophy-preview]',
  )!;
  const canvas = viewer.querySelector<HTMLElement>('[data-trophy-canvas]')!;
  const status = viewer.querySelector<HTMLElement>('[data-trophy-status]')!;
  let controller: AbortController | null = null;
  let dispose: (() => void) | undefined;

  function stop() {
    controller?.abort();
    controller = null;
    dispose?.();
    dispose = undefined;
    canvas.hidden = true;
    preview.hidden = false;
    close.hidden = true;
    open.hidden = false;
    open.disabled = false;
    open.setAttribute('aria-expanded', 'false');
  }

  open.addEventListener('click', async () => {
    const request = new AbortController();
    controller = request;
    open.disabled = true;
    close.hidden = false;
    open.setAttribute('aria-expanded', 'true');
    status.textContent = 'Cargando visor y modelo 3D…';
    try {
      const { mountTrophy } = await import('./ThreeJs/trophy-scene');
      if (request.signal.aborted) return;
      canvas.hidden = false;
      const cleanup = await mountTrophy(
        canvas,
        viewer.dataset.trophy!,
        request.signal,
      );
      if (request.signal.aborted) {
        cleanup();
        return;
      }
      dispose = cleanup;
      preview.hidden = true;
      open.hidden = true;
      status.textContent =
        'Arrastra para girar el trofeo y usa la rueda o dos dedos para acercarlo.';
      close.focus();
    } catch {
      if (request.signal.aborted) return;
      stop();
      status.textContent =
        'No se ha podido abrir el visor 3D. Puedes seguir consultando la imagen y los premios.';
      open.focus();
    }
  });

  close.addEventListener('click', () => {
    stop();
    status.textContent =
      'Visor cerrado. Puedes volver a abrirlo cuando quieras.';
    open.focus();
  });
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && controller) close.click();
  });
  window.addEventListener('pagehide', stop);
});
