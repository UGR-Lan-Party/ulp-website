import { siteMotion } from '../utils/site-motion.js';
import { enableTouchSwipe } from './touch-swipe';

document
  .querySelectorAll<HTMLElement>('[data-experience-carousel]')
  .forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-experience-track]')!;
    const previous = root.querySelector<HTMLButtonElement>(
      '[data-experience-previous]',
    )!;
    const next = root.querySelector<HTMLButtonElement>(
      '[data-experience-next]',
    )!;
    const status = root.querySelector<HTMLElement>('[data-experience-status]')!;
    const reducedMotion = siteMotion();
    let timer: number | undefined;
    let inView = false;
    let hovered = false;
    let focused = false;
    let moving = false;
    let animation: Animation | undefined;
    const slides = () => Array.from(track.children) as HTMLElement[];
    const canRotate = () =>
      inView &&
      !hovered &&
      !focused &&
      !document.hidden &&
      !reducedMotion.matches;

    function schedule(delay = 5000) {
      clearTimeout(timer);
      root.dataset.rotation = canRotate() ? 'running' : 'paused';
      if (canRotate())
        timer = window.setTimeout(() => void move(1, true), delay);
    }

    function syncSlides(announce = false) {
      const current = slides();
      current.forEach((slide, index) => {
        slide.inert = index >= 3;
        slide.setAttribute('aria-hidden', String(index >= 3));
        slide.toggleAttribute('data-visible', index < 3);
      });
      root.dataset.firstActivity = current[0].dataset.activityId;
      if (announce)
        status.textContent = `Ahora: ${current
          .slice(0, 3)
          .map((slide) => slide.querySelector('h3')!.textContent)
          .join(', ')}.`;
      const warm = [current[3], current.at(-1)];
      warm.forEach((slide) =>
        slide
          ?.querySelectorAll('img')
          .forEach((image) => (image.loading = 'eager')),
      );
    }

    async function move(direction: number, automatic = false) {
      if (moving || (automatic && !canRotate())) return;
      clearTimeout(timer);
      moving = true;
      previous.disabled = next.disabled = true;
      root.setAttribute('aria-busy', 'true');
      const incoming = direction > 0 ? slides()[3] : slides().at(-1)!;
      let timeout: number | undefined;
      await Promise.race([
        Promise.allSettled(
          Array.from(incoming.querySelectorAll('img')).map((image) => {
            image.loading = 'eager';
            return image.decode();
          }),
        ),
        new Promise((resolve) => (timeout = window.setTimeout(resolve, 2000))),
      ]);
      clearTimeout(timeout);
      if (automatic && !canRotate()) {
        moving = false;
        previous.disabled = next.disabled = false;
        root.setAttribute('aria-busy', 'false');
        schedule();
        return;
      }
      const cycleStarted = performance.now();
      const current = slides();
      const step =
        current[1].getBoundingClientRect().left -
        current[0].getBoundingClientRect().left;
      if (direction < 0) track.prepend(current.at(-1)!);
      try {
        if (!reducedMotion.matches) {
          animation = track.animate(
            [
              {
                transform: `translate3d(${direction > 0 ? 0 : -step}px, 0, 0)`,
              },
              {
                transform: `translate3d(${direction > 0 ? -step : 0}px, 0, 0)`,
              },
            ],
            {
              duration: 480,
              easing: 'cubic-bezier(.22, 1, .36, 1)',
              fill: 'forwards',
            },
          );
          await animation.finished;
        }
      } catch {
      } finally {
        if (direction > 0) track.append(current[0]);
        animation?.cancel();
        animation = undefined;
        moving = false;
        previous.disabled = next.disabled = false;
        root.setAttribute('aria-busy', 'false');
        syncSlides(!automatic);
        schedule(Math.max(0, 5000 - (performance.now() - cycleStarted)));
      }
    }

    enableTouchSwipe(
      root.querySelector<HTMLElement>('.experience-viewport')!,
      (direction) => void move(direction),
    );
    previous.hidden = next.hidden = false;
    previous.addEventListener('click', () => void move(-1));
    next.addEventListener('click', () => void move(1));
    root.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return;
      hovered = true;
      schedule();
    });
    root.addEventListener('pointerleave', () => {
      hovered = false;
      schedule();
    });
    root.addEventListener('focusin', () => {
      focused = true;
      schedule();
    });
    root.addEventListener('focusout', (event) => {
      focused = root.contains(event.relatedTarget as Node | null);
      schedule();
    });
    const syncMotion = () => {
      if (reducedMotion.matches) animation?.finish();
      schedule();
    };
    reducedMotion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', () => schedule());
    new ResizeObserver(() => animation?.finish()).observe(track);
    new IntersectionObserver(
      (entries) => {
        inView =
          entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
        schedule();
      },
      { threshold: 0.25 },
    ).observe(root);
    syncSlides();
    syncMotion();
  });

export {};
