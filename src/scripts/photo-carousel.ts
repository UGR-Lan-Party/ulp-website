import { siteMotion } from '../utils/site-motion.js';
import { enableTouchSwipe } from './touch-swipe';
import { getCarouselOrder } from '../utils/carousel-order.js';

function parsePhotos(value: string | undefined): string[] {
  try {
    const data: unknown = JSON.parse(value ?? '[]');
    if (!Array.isArray(data)) return [];
    return data
      .filter((source): source is string => {
        if (typeof source !== 'string') return false;
        try {
          const url = new URL(source, location.origin);
          return (
            url.origin === location.origin ||
            (url.protocol === 'https:' &&
              url.hostname.endsWith('.staticflickr.com'))
          );
        } catch {
          return false;
        }
      })
      .slice(0, 500);
  } catch {
    return [];
  }
}

function getSessionSeed() {
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  try {
    const existing = sessionStorage.getItem('ulp-photo-seed');
    if (existing) return existing;
    sessionStorage.setItem('ulp-photo-seed', random);
  } catch {}
  return random;
}

const sessionSeed = getSessionSeed();

const decodedPhotos = new Map<string, Promise<HTMLImageElement | null>>();
const reducedMotion = siteMotion();

function loadPhoto(
  source: string,
  retain = true,
): Promise<HTMLImageElement | null> {
  const cached = retain ? decodedPhotos.get(source) : undefined;
  if (cached) return cached;
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const timeout = setTimeout(() => resolve(null), 12000);
    image
      .decode()
      .then(() => {
        clearTimeout(timeout);
        resolve(image.naturalWidth ? image : null);
      })
      .catch(() => {
        clearTimeout(timeout);
        resolve(null);
      });
  });
  if (retain) decodedPhotos.set(source, promise);
  promise.then((image) => {
    if (!image && decodedPhotos.get(source) === promise)
      decodedPhotos.delete(source);
  });
  while (decodedPhotos.size > 12)
    decodedPhotos.delete(decodedPhotos.keys().next().value!);
  return promise;
}

document
  .querySelectorAll<HTMLElement>('[data-photo-carousel]')
  .forEach((root) => {
    const originalPhotos = parsePhotos(root.dataset.photos);
    const originalPreviews = parsePhotos(root.dataset.previews);
    const order = getCarouselOrder(
      originalPhotos.length,
      `${sessionSeed}:${root.id}`,
    );
    const indices = root.hasAttribute('data-shuffle-photos')
      ? order
      : originalPhotos.map((_, index) => index);
    const photos = indices.map((index) => originalPhotos[index]);
    const previews = indices.map(
      (index) => originalPreviews[index] ?? originalPhotos[index],
    );
    root.dataset.photos = JSON.stringify(photos);
    if (originalPreviews.length)
      root.dataset.previews = JSON.stringify(previews);
    const stage = root.querySelector<HTMLElement>('[data-carousel-stage]')!;
    const empty = root.querySelector<HTMLElement>('[data-carousel-empty]')!;
    stage.hidden = !photos.length;
    empty.hidden = Boolean(photos.length);
    if (!photos.length) return;

    const image = root.querySelector<HTMLImageElement>(
      '[data-carousel-image]',
    )!;
    const zoom = root.querySelector<HTMLAnchorElement>('[data-carousel-zoom]')!;
    const expanded = root.querySelector<HTMLImageElement>(
      '[data-carousel-expanded]',
    )!;
    const counter = root.querySelector<HTMLElement>('[data-carousel-counter]')!;
    const status = root.querySelector<HTMLElement>('[data-carousel-status]')!;
    const dialog = root.querySelector<HTMLDialogElement>(
      '[data-carousel-dialog]',
    )!;
    const neighbors = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[data-carousel-neighbor]'),
    );
    const retry = root.querySelector<HTMLButtonElement>('[data-carousel-retry]');
    let failedTarget: number | null = null;
    let current = 0;
    let requested = 0;
    let version = 0;
    const wrap = (index: number) =>
      ((index % photos.length) + photos.length) % photos.length;
    const neighborSource = (index: number) =>
      previews[wrap(index)] ?? photos[wrap(index)];

    function updateRatio(source = image) {
      if (source.naturalWidth && source.naturalHeight)
        root.style.setProperty(
          '--photo-ratio',
          String(source.naturalWidth / source.naturalHeight),
        );
    }
    image.addEventListener('load', () => updateRatio());

    function warmAdjacent() {
      const connection = (
        navigator as Navigator & {
          connection?: { saveData?: boolean; effectiveType?: string };
        }
      ).connection;
      if (
        !neighbors.length ||
        connection?.saveData ||
        ['slow-2g', '2g'].includes(connection?.effectiveType ?? '')
      )
        return;
      for (const offset of [-1, 1]) {
        void loadPhoto(previews[wrap(current + offset)]);
        void loadPhoto(neighborSource(current + offset * 2));
      }
    }

    let dragOffset = 0;
    let releaseOffset = 0;
    const movingCards = neighbors.length ? [zoom, ...neighbors] : [image];
    function resetDrag(animate = false) {
      const offset = dragOffset;
      movingCards.forEach((card) => {
        card.style.translate = '';
        if (animate && offset && !reducedMotion.matches)
          card.animate([{ translate: `${offset}px 0` }, { translate: '0 0' }], {
            duration: 180,
            easing: 'ease-out',
          });
      });
      dragOffset = 0;
      releaseOffset = 0;
    }

    function commit(index: number, loaded?: HTMLImageElement) {
      const changed = index !== current;
      const direction =
        index === wrap(current + 1) ? 1 : index === wrap(current - 1) ? -1 : 0;
      const fromDrag = releaseOffset;
      resetDrag();
      current = index;
      image.src = previews[current];
      image.alt = `Foto ${current + 1} de UGR LAN Party`;
      if (loaded) updateRatio(loaded);
      zoom.href = photos[current];
      root.querySelector<HTMLAnchorElement>('[data-carousel-original]')!.href =
        photos[current];
      zoom.setAttribute('aria-label', `Ampliar foto ${current + 1}`);
      counter.textContent = `Foto ${current + 1} de ${photos.length}`;
      root.querySelector('[data-expanded-counter]')!.textContent =
        counter.textContent;
      neighbors.forEach((button) => {
        button.hidden =
          photos.length < 2 ||
          Math.abs(Number(button.dataset.carouselNeighbor)) >
            Math.max(1, Math.floor((photos.length - 1) / 2));
        if (!button.hidden)
          button.querySelector('img')!.src = neighborSource(
            current + Number(button.dataset.carouselNeighbor),
          );
      });
      if (dialog.open) {
        expanded.src = photos[current];
        expanded.alt = image.alt;
      }
      if (changed && !reducedMotion.matches) {
        if (neighbors.length) {
          const step =
            zoom.getBoundingClientRect().width + (innerWidth <= 700 ? 12 : 16);
          for (const card of [zoom, ...neighbors]) {
            card.getAnimations().forEach((animation) => animation.cancel());
            card.animate(
              [
                { translate: `${direction * step + fromDrag}px 0`, opacity: 1 },
                { translate: '0 0', opacity: 1 },
              ],
              {
                duration: innerWidth <= 700 ? 260 : 360,
                easing: 'cubic-bezier(.22,.7,.2,1)',
              },
            );
          }
        } else {
          image.animate(
            [
              {
                translate: `${direction * Math.min(stage.clientWidth, 120) + fromDrag}px 0`,
                opacity: 0.8,
              },
              { translate: '0 0', opacity: 1 },
            ],
            { duration: 220, easing: 'ease-out' },
          );
        }
        if (dialog.open) {
          expanded.getAnimations().forEach((animation) => animation.cancel());
          expanded.animate([{ opacity: 0.6 }, { opacity: 1 }], {
            duration: 180,
            easing: 'ease-out',
          });
        }
      }
    }

    async function show(index: number) {
      const target = wrap(index);
      requested = target;
      const request = ++version;
      root.setAttribute('aria-busy', 'true');
      status.hidden = true;
      if (retry) retry.hidden = true;
      const loaded = await loadPhoto(
        dialog.open ? photos[target] : previews[target],
        !dialog.open,
      );
      if (request !== version) return;
      root.setAttribute('aria-busy', 'false');
      if (!loaded) {
        resetDrag(true);
        requested = current;
        failedTarget = target;
        if (retry) retry.hidden = false;
        status.textContent =
          'No se ha podido cargar esta foto. Puedes volver a intentarlo o abrir el álbum.';
        status.hidden = false;
        return;
      }
      failedTarget = null;
      commit(target, loaded);
      // Peripheral previews must never delay the selected photo.
      neighbors.forEach((button) => {
        const source = neighborSource(
          target + Number(button.dataset.carouselNeighbor),
        );
        void loadPhoto(source).then((result) => {
          if (request === version && !result) button.hidden = true;
        });
      });
      warmAdjacent();
    }

    retry?.addEventListener('click', () => {
      if (failedTarget !== null) void show(failedTarget);
    });
    let wheelAmount = 0;
    let wheelAt = 0;
    let wheelStepAt = -Infinity;
    const navigateWheel = (event: WheelEvent) => {
      if (event.ctrlKey || photos.length < 2) return;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      const now = performance.now();
      if (
        now - wheelAt > 150 ||
        (wheelAmount !== 0 && Math.sign(delta) !== Math.sign(wheelAmount))
      )
        wheelAmount = 0;
      wheelAt = now;
      if (now - wheelStepAt < 320) return;
      wheelAmount +=
        delta *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(wheelAmount) < 45) return;
      wheelStepAt = now;
      void show(requested + Math.sign(wheelAmount));
      wheelAmount = 0;
    };
    stage.addEventListener('wheel', navigateWheel, { passive: false });
    dialog.addEventListener('wheel', navigateWheel, { passive: false });
    enableTouchSwipe(stage, (direction) => void show(requested + direction), {
      onStart() {
        movingCards.forEach((card) =>
          card.getAnimations().forEach((animation) => animation.cancel()),
        );
      },
      onDrag(distance) {
        dragOffset = Math.max(
          -stage.clientWidth,
          Math.min(stage.clientWidth, distance),
        );
        if (!reducedMotion.matches)
          movingCards.forEach((card) => {
            card.style.translate = `${dragOffset}px 0`;
          });
      },
      onRelease(committed) {
        if (committed) releaseOffset = dragOffset;
        else resetDrag(true);
      },
    });
    enableTouchSwipe(dialog, (direction) => void show(requested + direction));
    neighbors.forEach((button) =>
      button.addEventListener(
        'click',
        () => void show(requested + Number(button.dataset.carouselNeighbor)),
      ),
    );
    for (const [selector, offset] of [
      ['[data-carousel-previous], [data-expanded-previous]', -1],
      ['[data-carousel-next], [data-expanded-next]', 1],
    ] as const) {
      root.querySelectorAll<HTMLButtonElement>(selector).forEach((button) => {
        button.hidden = photos.length < 2;
        button.addEventListener('click', () => void show(requested + offset));
      });
    }
    zoom.addEventListener('click', (event) => {
      event.preventDefault();
      const index = current;
      expanded.src = previews[index];
      expanded.alt = image.alt;
      dialog.showModal();
      void loadPhoto(photos[index], false).then((loaded) => {
        if (loaded && dialog.open && current === index)
          expanded.src = photos[index];
      });
    });
    root
      .querySelector('[data-carousel-close]')!
      .addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      expanded.removeAttribute('src');
      zoom.focus({ preventScroll: true });
    });
    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        void show(requested + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches)
        [image, zoom, expanded, ...neighbors].forEach((element) =>
          element.getAnimations().forEach((animation) => animation.cancel()),
        );
    });
    commit(0);
    if (image.complete) updateRatio();
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        warmAdjacent();
        observer.disconnect();
      },
      { rootMargin: '200px' },
    );
    observer.observe(root);
  });
export {};
