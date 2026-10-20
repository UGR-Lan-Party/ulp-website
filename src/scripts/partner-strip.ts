document
  .querySelectorAll<HTMLElement>('[data-partner-strip]')
  .forEach((root) => {
    const viewport = root.querySelector<HTMLElement>(
      '[data-partner-viewport]',
    )!;
    const list = root.querySelector<HTMLElement>('[data-partner-list]')!;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let hovered = false;
    let focused = false;
    let touching = false;
    let fingerDown = false;
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let fractionalDistance = 0;
    let stopped = false;
    let resumeTimer: number | undefined;

    const canAnimate = () =>
      !stopped &&
      visible &&
      !document.hidden &&
      !reducedMotion.matches &&
      !hovered &&
      !focused &&
      !touching;
    const hasKeyboardFocus = () =>
      root.contains(document.activeElement) &&
      document.activeElement?.matches(':focus-visible') === true;

    function move(distance: number) {
      const width = list.offsetWidth;
      if (width)
        viewport.scrollLeft =
          (((viewport.scrollLeft + distance) % width) + width) % width;
    }

    function animate(time: number) {
      frame = 0;
      if (!canAnimate()) {
        root.dataset.rotation = 'paused';
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
      root.dataset.rotation = canAnimate() ? 'running' : 'paused';
      if (canAnimate()) frame = requestAnimationFrame(animate);
    }

    function resumeAfterTouch() {
      clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        touching = false;
        focused = hasKeyboardFocus();
        update();
      }, 400);
    }

    root.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return;
      hovered = true;
      update();
    });
    root.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'touch') return;
      hovered = false;
      update();
    });
    root.addEventListener('focusin', () => {
      focused = hasKeyboardFocus();
      update();
    });
    root.addEventListener('focusout', () =>
      requestAnimationFrame(() => {
        focused = hasKeyboardFocus();
        update();
      }),
    );
    root.addEventListener(
      'touchstart',
      () => {
        clearTimeout(resumeTimer);
        fingerDown = touching = true;
        hovered = focused = false;
        update();
      },
      { passive: true },
    );
    const endTouch = (event: TouchEvent) => {
      if (!touching || event.touches.length) return;
      fingerDown = false;
      resumeAfterTouch();
    };
    window.addEventListener('touchend', endTouch, { passive: true });
    window.addEventListener('touchcancel', endTouch, { passive: true });
    viewport.addEventListener(
      'scroll',
      () => {
        if (touching && !fingerDown) resumeAfterTouch();
      },
      { passive: true },
    );

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
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    reducedMotion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('pagehide', () => {
      stopped = true;
      clearTimeout(resumeTimer);
      cancelAnimationFrame(frame);
      observer.disconnect();
    });
    window.addEventListener('pageshow', (event) => {
      if (!event.persisted) return;
      stopped = touching = fingerDown = hovered = false;
      focused = hasKeyboardFocus();
      observer.observe(root);
    });
  });
