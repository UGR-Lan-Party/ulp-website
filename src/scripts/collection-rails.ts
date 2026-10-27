import { siteMotion } from '../utils/site-motion.js';
document
  .querySelectorAll<HTMLElement>('[data-collection-rail]')
  .forEach((root) => {
    const viewport = root.querySelector<HTMLElement>('[data-rail-viewport]')!;
    const pause = root.querySelector<HTMLButtonElement>('[data-rail-pause]');
    const reduced = siteMotion();
    const loop = root.hasAttribute('data-rail-loop');
    let frame = 0,
      last = 0,
      position = 0,
      visible = false,
      hover = false,
      focused = false,
      paused = false,
      modal = false,
      interacting = false;
    const period = () => {
      const first = root.querySelector<HTMLElement>('[data-rail-item]'),
        copy = root.querySelector<HTMLElement>('[data-rail-copy]');
      return first && copy ? copy.offsetLeft - first.offsetLeft : 0;
    };
    const normalize = (value: number) => {
      const width = period();
      return loop && width ? ((value % width) + width) % width : value;
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const allowed = () =>
      loop &&
      !reduced.matches &&
      visible &&
      !hover &&
      !focused &&
      !paused &&
      !modal &&
      !interacting &&
      !document.hidden;
    function tick(now: number) {
      frame = 0;
      if (!allowed()) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      position = normalize(position + dt * 28);
      viewport.scrollLeft = position;
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      stop();
      position = viewport.scrollLeft;
      if (allowed()) frame = requestAnimationFrame(tick);
    }
    viewport.addEventListener(
      'wheel',
      (e) => {
        if (
          e.ctrlKey ||
          e.metaKey ||
          viewport.scrollWidth <= viewport.clientWidth + 1
        )
          return;
        const delta =
          (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) *
          (e.deltaMode === 1
            ? 16
            : e.deltaMode === 2
              ? viewport.clientWidth
              : 1);
        if (!delta) return;
        e.preventDefault();
        viewport.scrollLeft = normalize(viewport.scrollLeft + delta);
        sync();
      },
      { passive: false },
    );
    viewport.addEventListener('keydown', (e) => {
      if (
        e.target !== viewport ||
        !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
      )
        return;
      e.preventDefault();
      const card = root.querySelector<HTMLElement>('[data-rail-item]')!;
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? loop
              ? period() - card.offsetWidth
              : viewport.scrollWidth
            : viewport.scrollLeft +
              (e.key === 'ArrowLeft' ? -1 : 1) * (card.offsetWidth + 16);
      viewport.scrollLeft = normalize(next);
      sync();
    });
    root.addEventListener('pointerenter', () => {
      hover = true;
      sync();
    });
    root.addEventListener('pointerleave', () => {
      hover = false;
      sync();
    });
    root.addEventListener('focusin', (e) => {
      focused = viewport.contains(e.target as Node);
      sync();
    });
    root.addEventListener('focusout', (e) => {
      focused = viewport.contains(e.relatedTarget as Node);
      sync();
    });
    root.addEventListener('collectible-modal', (e) => {
      modal = (e as CustomEvent).detail;
      sync();
    });
    root.addEventListener('collectible-interaction', (e) => {
      interacting = (e as CustomEvent).detail;
      sync();
    });
    pause?.addEventListener('click', () => {
      paused = !paused;
      pause.setAttribute('aria-pressed', String(paused));
      pause.setAttribute(
        'aria-label',
        `${paused ? 'Activar' : 'Pausar'} carrusel de camisetas`,
      );
      pause.querySelector('[data-rail-pause-label]')!.textContent = paused
        ? 'Activar'
        : 'Pausar';
      sync();
    });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }).observe(root);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', sync);
  });
