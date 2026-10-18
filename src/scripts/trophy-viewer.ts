document.querySelectorAll<HTMLElement>('.trophy-viewer').forEach((viewer) => {
  const canvas = viewer.querySelector<HTMLElement>('[data-trophy-canvas]')!;
  const status = viewer.querySelector<HTMLElement>('[data-trophy-status]')!;
  const retry = viewer.querySelector<HTMLButtonElement>('[data-trophy-retry]')!;
  const expand = viewer.querySelector<HTMLButtonElement>(
    '[data-trophy-expand]',
  )!;
  const dialog = viewer.querySelector<HTMLDialogElement>(
    '[data-trophy-dialog]',
  )!;
  const inline = viewer.querySelector<HTMLElement>('[data-trophy-inline]')!;
  const expanded = viewer.querySelector<HTMLElement>('[data-trophy-expanded]')!;
  let previousOverflow = '';
  let controller: AbortController | null = null;
  let dispose: (() => void) | undefined;

  async function start() {
    if (controller) return;
    const request = new AbortController();
    controller = request;
    retry.hidden = true;
    status.textContent = 'Cargando trofeo 3D…';
    try {
      const { mountTrophy } = await import('./ThreeJs/trophy-scene');
      if (request.signal.aborted) return;
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
      expand.hidden = false;
      status.textContent =
        'Arrastra para girar el trofeo y usa la rueda o dos dedos para acercarlo.';
    } catch {
      if (request.signal.aborted) return;
      controller = null;
      status.textContent =
        'No se ha podido cargar el trofeo. Inténtalo de nuevo.';
      retry.hidden = false;
    }
  }

  expand.addEventListener('click', () => {
    if (dialog.open) return;
    previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    expanded.appendChild(canvas);
    document.documentElement.style.overflow = 'hidden';
    dialog.querySelector<HTMLButtonElement>('[data-trophy-close]')!.focus();
  });
  dialog
    .querySelector('[data-trophy-close]')!
    .addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  dialog.addEventListener('close', () => {
    inline.appendChild(canvas);
    document.documentElement.style.overflow = previousOverflow;
    expand.focus({ preventScroll: true });
  });

  void start();
  retry.addEventListener('click', start);
  window.addEventListener('pagehide', () => {
    if (dialog.open) dialog.close();
    controller?.abort();
    controller = null;
    dispose?.();
    dispose = undefined;
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) void start();
  });
});
