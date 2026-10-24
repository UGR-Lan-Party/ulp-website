export {};
document
  .querySelectorAll<HTMLElement>('[data-location-preview]')
  .forEach((root) => {
    const canvas = root.querySelector<HTMLElement>('[data-location-canvas]')!;
    const drawing = root.querySelector<SVGSVGElement>(
      '[data-location-drawing]',
    )!;
    const value = root.querySelector<HTMLElement>(
      '[data-location-zoom-value]',
    )!;
    const closer = root.querySelector<HTMLButtonElement>(
      '[data-location-zoom="in"]',
    )!;
    const farther = root.querySelector<HTMLButtonElement>(
      '[data-location-zoom="out"]',
    )!;
    const scaleBar = root.querySelector<HTMLElement>(
      '[data-location-scale-bar]',
    )!;
    const scaleValue = root.querySelector<HTMLElement>(
      '[data-location-scale-value]',
    )!;
    let zoom = 1;
    let x = 0,
      y = 0;
    let drag:
      | {
          id: number;
          clientX: number;
          clientY: number;
          x: number;
          y: number;
          scale: number;
        }
      | undefined;
    function update() {
      x = Math.max(0, Math.min(800 - 800 / zoom, x));
      y = Math.max(0, Math.min(600 - 600 / zoom, y));
      drawing.setAttribute('viewBox', `${x} ${y} ${800 / zoom} ${600 / zoom}`);
      canvas.toggleAttribute('data-zoomed', zoom > 1);
      value.textContent = `${Math.round(zoom * 100)}%`;
      closer.disabled = zoom >= 6;
      farther.disabled = zoom <= 1;
      const scale = drawing.getScreenCTM()?.a ?? 1;
      const meters =
        [100, 50, 20, 10, 5].find(
          (meters) =>
            meters * 1.55 * scale <= Math.min(110, canvas.clientWidth * 0.25),
        ) ?? 5;
      scaleBar.style.width = `${meters * 1.55 * scale}px`;
      scaleValue.textContent = `${meters} m`;
    }
    function zoomTo(next: number, clientX?: number, clientY?: number) {
      next = Math.max(1, Math.min(6, next));
      const point =
        clientX === undefined ||
        clientY === undefined ||
        !drawing.getScreenCTM()
          ? { x: x + 400 / zoom, y: y + 300 / zoom }
          : new DOMPoint(clientX, clientY).matrixTransform(
              drawing.getScreenCTM()!.inverse(),
            );
      const fractionX = Math.max(0, Math.min(1, (point.x - x) / (800 / zoom)));
      const fractionY = Math.max(0, Math.min(1, (point.y - y) / (600 / zoom)));
      x = point.x - (fractionX * 800) / next;
      y = point.y - (fractionY * 600) / next;
      zoom = next;
      update();
    }
    canvas.addEventListener(
      'wheel',
      (event) => {
        if (event.ctrlKey || !event.deltaY) return;
        event.preventDefault();
        const delta =
          event.deltaY *
          (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 600 : 1);
        zoomTo(zoom * Math.exp(-delta * 0.002), event.clientX, event.clientY);
      },
      { passive: false },
    );
    closer.addEventListener('click', () => zoomTo(zoom * 1.4));
    farther.addEventListener('click', () => zoomTo(zoom / 1.4));
    root
      .querySelector('[data-location-zoom="reset"]')!
      .addEventListener('click', () => zoomTo(1));
    canvas.addEventListener('keydown', (event) => {
      if (event.target !== canvas) return;
      if (
        [
          '+',
          '=',
          '-',
          '0',
          'Home',
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
        ].includes(event.key)
      )
        event.preventDefault();
      if (event.key === '+' || event.key === '=') zoomTo(zoom * 1.4);
      else if (event.key === '-') zoomTo(zoom / 1.4);
      else if (event.key === '0' || event.key === 'Home') zoomTo(1);
      else if (event.key.startsWith('Arrow')) {
        if (event.key === 'ArrowLeft') x -= 80 / zoom;
        if (event.key === 'ArrowRight') x += 80 / zoom;
        if (event.key === 'ArrowUp') y -= 60 / zoom;
        if (event.key === 'ArrowDown') y += 60 / zoom;
        update();
      }
    });
    drawing.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || zoom <= 1) return;
      drag = {
        id: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        x,
        y,
        scale: drawing.getScreenCTM()?.a ?? 1,
      };
      drawing.setPointerCapture(event.pointerId);
      canvas.setAttribute('data-dragging', '');
    });
    drawing.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      x = drag.x - (event.clientX - drag.clientX) / drag.scale;
      y = drag.y - (event.clientY - drag.clientY) / drag.scale;
      update();
    });
    function finishDrag() {
      drag = undefined;
      canvas.removeAttribute('data-dragging');
    }
    drawing.addEventListener('pointerup', finishDrag);
    drawing.addEventListener('pointercancel', finishDrag);
    drawing.addEventListener('lostpointercapture', finishDrag);
    new ResizeObserver(update).observe(drawing);
    update();
  });
