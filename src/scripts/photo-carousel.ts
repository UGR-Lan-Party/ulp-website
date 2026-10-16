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
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function loadPhoto(source: string): Promise<HTMLImageElement | null> {
  const cached = decodedPhotos.get(source);
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
  decodedPhotos.set(source, promise);
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
    let current = 0;
    let requested = 0;
    let version = 0;
    const wrap = (index: number) => (index + photos.length) % photos.length;
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
      if (!neighbors.length) return;
      for (const offset of [-1, 1]) {
        void loadPhoto(photos[wrap(current + offset)]);
        void loadPhoto(neighborSource(current + offset * 2));
      }
    }

    function commit(
      index: number,
      loaded?: HTMLImageElement,
      neighborImages?: (HTMLImageElement | null)[],
    ) {
      const changed = index !== current;
      current = index;
      image.src = photos[current];
      image.alt = `Foto ${current + 1} de UGR LAN Party`;
      if (loaded) updateRatio(loaded);
      zoom.href = photos[current];
      zoom.setAttribute('aria-label', `Ampliar foto ${current + 1}`);
      counter.textContent = `Foto ${current + 1} de ${photos.length}`;
      neighbors.forEach((button, offset) => {
        button.hidden = photos.length < 2 || neighborImages?.[offset] === null;
        if (!button.hidden)
          button.querySelector('img')!.src = neighborSource(
            current + Number(button.dataset.carouselNeighbor),
          );
      });
      if (dialog.open) {
        expanded.src = photos[current];
        expanded.alt = image.alt;
      }
      if (changed && neighbors.length && !reducedMotion.matches) {
        image.getAnimations().forEach((animation) => animation.cancel());
        image.animate(
          [
            { opacity: 0.85, transform: 'scale(1.025)' },
            { opacity: 1, transform: 'scale(1)' },
          ],
          { duration: 260, easing: 'ease-out' },
        );
      }
    }

    async function show(index: number) {
      const target = wrap(index);
      requested = target;
      const request = ++version;
      root.setAttribute('aria-busy', 'true');
      status.hidden = true;
      const [loaded, ...neighborImages] = await Promise.all([
        loadPhoto(photos[target]),
        ...neighbors.map((button) =>
          loadPhoto(
            neighborSource(target + Number(button.dataset.carouselNeighbor)),
          ),
        ),
      ]);
      if (request !== version) return;
      root.setAttribute('aria-busy', 'false');
      if (!loaded) {
        requested = current;
        status.textContent =
          'No se ha podido cargar esta foto. Puedes volver a intentarlo o abrir el álbum.';
        status.hidden = false;
        return;
      }
      commit(target, loaded, neighborImages);
      warmAdjacent();
    }

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
      expanded.src = photos[current];
      expanded.alt = image.alt;
      dialog.showModal();
    });
    root
      .querySelector('[data-carousel-close]')!
      .addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => zoom.focus({ preventScroll: true }));
    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        void show(requested + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches)
        image.getAnimations().forEach((animation) => animation.cancel());
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
