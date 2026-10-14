import { mountTrophy } from './ThreeJs/trophy-scene';

document.querySelectorAll<HTMLElement>('.trophy-viewer').forEach((viewer) => {
  const canvas = viewer.querySelector<HTMLElement>('[data-trophy-canvas]')!;
  const status = viewer.querySelector<HTMLElement>('[data-trophy-status]')!;
  const retry = viewer.querySelector<HTMLButtonElement>('[data-trophy-retry]')!;
  let controller: AbortController | null = null;
  let dispose: (() => void) | undefined;

  async function start() {
    if (controller) return;
    const request = new AbortController();
    controller = request;
    retry.hidden = true;
    status.textContent = 'Cargando trofeo 3D…';
    try {
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

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void start();
    },
    { rootMargin: '200px' },
  );
  observer.observe(viewer);
  retry.addEventListener('click', start);
  window.addEventListener('pagehide', () => {
    observer.disconnect();
    controller?.abort();
    controller = null;
    dispose?.();
    dispose = undefined;
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) observer.observe(viewer);
  });
});
