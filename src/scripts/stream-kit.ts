const root = document.querySelector<HTMLElement>('[data-stream-kit]');
if (root) {
  const links = Array.from(
    root.querySelectorAll<HTMLAnchorElement>('[data-stream-game]'),
  );
  const profiles = Array.from(
    root.querySelectorAll<HTMLElement>('[data-stream-profile]'),
  );
  const activate = (id: string) => {
    if (!profiles.some((p) => p.dataset.streamProfile === id))
      id = profiles[0].dataset.streamProfile!;
    profiles.forEach((p) => (p.hidden = p.dataset.streamProfile !== id));
    links.forEach((a) => {
      if (a.dataset.streamGame === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  activate(location.hash.slice(1).replace(/^archive-/, ''));
  links.forEach((link, i) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.streamGame!;
      activate(id);
      history.replaceState(null, '', `#archive-${id}`);
    });
    link.addEventListener('keydown', (e) => {
      let next: number;
      if (e.key === 'ArrowRight') next = (i + 1) % links.length;
      else if (e.key === 'ArrowLeft')
        next = (i - 1 + links.length) % links.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = links.length - 1;
      else return;
      e.preventDefault();
      links[next].focus();
      links[next].click();
    });
  });
  window.addEventListener('hashchange', () =>
    activate(location.hash.slice(1).replace(/^archive-/, '')),
  );
  const dialog = root.querySelector<HTMLDialogElement>('[data-stream-dialog]')!;
  const expanded = dialog.querySelector<HTMLElement>('[data-stream-expanded]')!;
  let trigger: HTMLButtonElement | null = null,
    previousOverflow = '';
  profiles.forEach((profile) => {
    const stage = profile.querySelector<HTMLElement>('[data-stream-stage]')!;
    const inputs = Array.from(
      profile.querySelectorAll<HTMLInputElement>('[data-stream-layer]'),
    );
    const transparency = profile.querySelector<HTMLButtonElement>(
      '[data-stream-transparency]',
    )!;
    const update = () => {
      const transparent = transparency.getAttribute('aria-pressed') === 'true';
      const background = inputs.find(
        (i) =>
          stage.querySelector<HTMLElement>(
            `[data-layer="${i.dataset.streamLayer}"]`,
          )?.dataset.kind === 'fondo',
      );
      stage.dataset.transparent = String(transparent || !background?.checked);
      const custom = profile.dataset.customOverlay === 'true';
      inputs.forEach((input) => {
        const layer = Array.from(
          stage.querySelectorAll<HTMLElement>('[data-layer]'),
        ).find((el) => el.dataset.layer === input.dataset.streamLayer)!;
        layer.hidden =
          !input.checked ||
          (transparent && layer.dataset.kind === 'fondo') ||
          (custom && layer.dataset.kind === 'rotulo') ||
          (custom &&
            layer.dataset.kind === 'overlay' &&
            profile.dataset.customFrame === 'false');
        if (layer.dataset.kind === 'rotulo')
          input.closest('label')!.hidden = custom;
      });
    };
    inputs.forEach((i) => i.addEventListener('change', update));
    profile.addEventListener('overlay-preview-change', update);
    transparency.addEventListener('click', () => {
      const next = transparency.getAttribute('aria-pressed') !== 'true';
      transparency.setAttribute('aria-pressed', String(next));
      transparency.textContent = next ? 'Ver composición' : 'Ver transparencia';
      update();
    });
    profile.querySelector<HTMLElement>('[data-stream-tools]')!.hidden = false;
    const expand = profile.querySelector<HTMLButtonElement>(
      '[data-stream-expand]',
    )!;
    expand.hidden = false;
    expand.addEventListener('click', () => {
      trigger = expand;
      const clone = stage.cloneNode(true) as HTMLElement;
      clone.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        if (!img.hidden) img.src = img.dataset.original!;
        img.loading = 'eager';
      });
      const originals = stage.querySelectorAll('canvas');
      clone.querySelectorAll('canvas').forEach((canvas, index) => {
        canvas.width = originals[index].width;
        canvas.height = originals[index].height;
        canvas.getContext('2d')!.drawImage(originals[index], 0, 0);
      });
      expanded.replaceChildren(clone);
      dialog.querySelector('h2')!.textContent =
        `${profile.dataset.profileName} · Vista previa`;
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('[data-stream-close]')!.focus();
    });
  });
  dialog
    .querySelector('[data-stream-close]')!
    .addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (
      e.clientX < b.left ||
      e.clientX > b.right ||
      e.clientY < b.top ||
      e.clientY > b.bottom
    )
      dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = previousOverflow;
    expanded.replaceChildren();
    trigger?.focus({ preventScroll: true });
  });
  window.addEventListener('pagehide', () => {
    if (dialog.open) dialog.close();
  });
}
