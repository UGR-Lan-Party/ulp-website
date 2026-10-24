document
  .querySelectorAll<HTMLElement>('[data-poster-gallery]')
  .forEach((root) => {
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('[data-poster-open]'),
    );
    const dialog = root.querySelector<HTMLDialogElement>(
      '[data-poster-dialog]',
    )!;
    const image = dialog.querySelector<HTMLImageElement>(
      '[data-poster-image]',
    )!;
    const title = dialog.querySelector<HTMLElement>('[data-poster-title]')!;
    const original = dialog.querySelector<HTMLAnchorElement>(
      '[data-poster-original]',
    )!;
    let active = 0,
      overflow = '';
    function show(index: number) {
      active = (index + links.length) % links.length;
      const link = links[active];
      image.src = link.href;
      image.alt = `Cartel oficial UGR LAN Party ${link.dataset.year}`;
      title.textContent = `Cartel ULP ${link.dataset.year}`;
      original.href = link.href;
    }
    links.forEach((link, index) =>
      link.addEventListener('click', (event) => {
        if (
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        show(index);
        overflow = document.documentElement.style.overflow;
        dialog.showModal();
        document.documentElement.style.overflow = 'hidden';
        dialog.querySelector<HTMLButtonElement>('[data-poster-close]')!.focus();
      }),
    );
    dialog
      .querySelector('[data-poster-close]')!
      .addEventListener('click', () => dialog.close());
    dialog
      .querySelector('[data-poster-previous]')!
      .addEventListener('click', () => show(active - 1));
    dialog
      .querySelector('[data-poster-next]')!
      .addEventListener('click', () => show(active + 1));
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        show(active + (e.key === 'ArrowLeft' ? -1 : 1));
      }
    });
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
      document.documentElement.style.overflow = overflow;
      links[active].focus({ preventScroll: true });
    });
    window.addEventListener('pagehide', () => {
      if (dialog.open) dialog.close();
    });
  });
