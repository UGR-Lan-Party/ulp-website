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

document
  .querySelectorAll<HTMLElement>('[data-photo-carousel]')
  .forEach((root) => {
    const photos = parsePhotos(root.dataset.photos);
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
    const dialog = root.querySelector<HTMLDialogElement>(
      '[data-carousel-dialog]',
    )!;
    let current = 0;

    function show(index: number) {
      current = (index + photos.length) % photos.length;
      image.src = photos[current];
      image.alt = `Foto ${current + 1} de UGR LAN Party`;
      zoom.href = photos[current];
      zoom.setAttribute('aria-label', `Ampliar foto ${current + 1}`);
      counter.textContent = `Foto ${current + 1} de ${photos.length}`;
      if (dialog.open) {
        expanded.src = photos[current];
        expanded.alt = image.alt;
      }
    }

    for (const [selector, offset] of [
      ['[data-carousel-previous], [data-expanded-previous]', -1],
      ['[data-carousel-next], [data-expanded-next]', 1],
    ] as const) {
      root.querySelectorAll<HTMLButtonElement>(selector).forEach((button) => {
        button.hidden = photos.length < 2;
        button.addEventListener('click', () => show(current + offset));
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
        show(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    show(0);
  });
