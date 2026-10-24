import type { mountCollectible } from './ThreeJs/collectible-scene';

document.querySelectorAll<HTMLElement>('[data-collectible]').forEach((root) => {
  const stage = root.querySelector<HTMLElement>('[data-model-stage]')!;
  const inline = root.querySelector<HTMLElement>('[data-model-inline]')!;
  const status = root.querySelector<HTMLElement>('[data-model-status]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-model-retry]')!;
  const expand = root.querySelector<HTMLButtonElement>('[data-model-expand]');
  const dialog = root.querySelector<HTMLDialogElement>('[data-model-dialog]')!;
  const close = dialog.querySelector<HTMLButtonElement>('[data-model-close]')!;
  let controller: AbortController | null = null;
  let api: Awaited<ReturnType<typeof mountCollectible>> | undefined;
  let previousOverflow = '';
  const modal = (open: boolean) =>
    root.dispatchEvent(
      new CustomEvent('collectible-modal', { bubbles: true, detail: open }),
    );
  function fail() {
    controller?.abort();
    controller = null;
    api?.dispose();
    api = undefined;
    stage.removeAttribute('data-model-ready');
    root.removeAttribute('data-ready');
    if (expand) expand.hidden = true;
    status.textContent = 'Vista 3D no disponible';
    retry.hidden = false;
  }
  async function start() {
    if (controller) return;
    const request = new AbortController();
    controller = request;
    retry.hidden = true;
    status.textContent = 'Cargando vista 3D…';
    try {
      const { mountCollectible } = await import('./ThreeJs/collectible-scene');
      if (request.signal.aborted) return;
      const instance = await mountCollectible(
        stage,
        root.dataset.collectible as 'shirt' | 'skin',
        root.dataset.collectible === 'shirt'
          ? JSON.parse(root.dataset.design!)
          : root.dataset.design!,
        request.signal,
        fail,
      );
      if (request.signal.aborted) {
        instance.dispose();
        return;
      }
      api = instance;
      stage.setAttribute('data-model-ready', '');
      root.setAttribute('data-ready', '');
      if (expand) expand.hidden = false;
      status.textContent =
        'Vista 3D lista. Arrastra para girar o usa las flechas.';
    } catch {
      if (!request.signal.aborted) fail();
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void start();
        observer.unobserve(root);
      }
    },
    { rootMargin: '120px 0px' },
  );
  observer.observe(root);
  retry.addEventListener('click', () => void start());
  root
    .querySelector<HTMLButtonElement>('[data-model-pause]')
    ?.addEventListener('click', (e) => {
      const button = e.currentTarget as HTMLButtonElement,
        paused = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Activar giro' : 'Pausar giro';
      api?.pause(paused);
    });
  if (root.dataset.collectible === 'shirt') {
    let gesture: { id: number; x: number; y: number; dragged: boolean } | null =
      null;
    stage.addEventListener(
      'pointerdown',
      (event) => {
        if (event.button !== 0) return;
        gesture = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          dragged: false,
        };
      },
      { capture: true },
    );
    stage.addEventListener('pointermove', (event) => {
      if (gesture?.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 6)
        gesture.dragged = true;
    });
    stage.addEventListener('pointercancel', () => {
      if (gesture) gesture.dragged = true;
    });
    stage.addEventListener('click', () => {
      if (api && !dialog.open && !gesture?.dragged) openViewer();
      gesture = null;
    });
    stage.addEventListener('keydown', (event) => {
      if (!api || dialog.open || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      openViewer();
    });
  }
  function openViewer() {
    if (dialog.open) return;
    previousOverflow = document.documentElement.style.overflow;
    document.body.append(dialog);
    dialog.showModal();
    dialog.querySelector('[data-model-expanded]')!.append(stage);
    document.documentElement.style.overflow = 'hidden';
    modal(true);
    close.focus();
  }
  expand?.addEventListener('click', openViewer);
  close.addEventListener('click', () => dialog.close());
  dialog
    .querySelector('[data-model-reset]')!
    .addEventListener('click', () => api?.reset());
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
  dialog.addEventListener('close', () => {
    inline.append(stage);
    root.append(dialog);
    document.documentElement.style.overflow = previousOverflow;
    modal(false);
    (expand ?? stage.querySelector('canvas'))?.focus({ preventScroll: true });
  });
  stage.addEventListener(
    'wheel',
    (e) => {
      if ((dialog.open || root.dataset.collectible === 'skin') && !e.ctrlKey) {
        e.preventDefault();
        api?.zoomBy(Math.exp(-e.deltaY * 0.0015));
      }
    },
    { passive: false },
  );
  window.addEventListener('pagehide', () => {
    if (dialog.open) dialog.close();
    controller?.abort();
    controller = null;
    api?.dispose();
    api = undefined;
    observer.disconnect();
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) observer.observe(root);
  });
});
