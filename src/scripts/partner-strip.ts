document
  .querySelectorAll<HTMLElement>('[data-partner-strip]')
  .forEach((root) => {
    const viewport = root.querySelector<HTMLElement>(
      '[data-partner-viewport]',
    )!;
    const list = root.querySelector<HTMLElement>('[data-partner-list]')!;
    const controls = root.querySelector<HTMLElement>(
      '[data-partner-controls]',
    )!;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let hovered = false;
    let focused = false;
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let fractionalDistance = 0;
    let stopped = false;
    controls.hidden = false;

    function move(distance: number) {
      const width = list.offsetWidth;
      if (width)
        viewport.scrollLeft =
          (((viewport.scrollLeft + distance) % width) + width) % width;
    }
    function animate(time: number) {
      frame = 0;
      if (
        stopped ||
        !visible ||
        document.hidden ||
        reducedMotion.matches ||
        hovered ||
        focused
      ) {
        lastTime = 0;
        return;
      }
      if (lastTime) {
        fractionalDistance += Math.min(time - lastTime, 50) * 0.022;
        const distance = Math.trunc(fractionalDistance);
        if (distance) {
          move(distance);
          fractionalDistance -= distance;
        }
      }
      lastTime = time;
      frame = requestAnimationFrame(animate);
    }
    function update() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      frame = requestAnimationFrame(animate);
    }
    root.addEventListener('pointerenter', () => {
      hovered = true;
      update();
    });
    root.addEventListener('pointerleave', () => {
      hovered = false;
      update();
    });
    root.addEventListener('focusin', () => {
      focused = true;
      update();
    });
    root.addEventListener('focusout', () => {
      requestAnimationFrame(() => {
        focused = root.contains(document.activeElement);
        update();
      });
    });
    viewport.addEventListener(
      'wheel',
      (event) => {
        if (event.ctrlKey) return;
        const delta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;
        if (!delta) return;
        event.preventDefault();
        move(
          delta *
            (event.deltaMode === 1
              ? 20
              : event.deltaMode === 2
                ? viewport.clientWidth
                : 1),
        );
      },
      { passive: false },
    );
    viewport.addEventListener('mousedown', (event) => {
      if (event.button !== 1) return;
      event.preventDefault();
      move(viewport.clientWidth * 0.65);
    });
    viewport.addEventListener('auxclick', (event) => {
      if (event.button === 1) event.preventDefault();
    });
    viewport.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      move((event.key === 'ArrowLeft' ? -1 : 1) * 180);
    });
    root
      .querySelectorAll<HTMLButtonElement>('[data-partner-step]')
      .forEach((button) => {
        button.addEventListener('click', () =>
          move(
            Number(button.dataset.partnerStep) * viewport.clientWidth * 0.65,
          ),
        );
      });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    reducedMotion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('pagehide', () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    });
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        stopped = false;
        observer.observe(root);
      }
    });
  });
