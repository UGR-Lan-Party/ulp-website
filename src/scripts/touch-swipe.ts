interface SwipeFeedback {
  onStart?: () => void;
  onDrag?: (distance: number) => void;
  onRelease?: (committed: boolean) => void;
}
export function enableTouchSwipe(
  element: HTMLElement,
  onSwipe: (direction: -1 | 1) => void,
  feedback: SwipeFeedback = {},
) {
  let start: { id: number; x: number; y: number } | null = null;
  let swiped = false;
  let horizontal = false;
  let frame = 0;
  let distance = 0;
  const release = (committed: boolean) => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (horizontal) feedback.onDrag?.(distance);
    feedback.onRelease?.(committed);
    start = null;
    horizontal = false;
  };
  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch' || !event.isPrimary) return;
    swiped = false;
    horizontal = false;
    distance = 0;
    start = { id: event.pointerId, x: event.clientX, y: event.clientY };
    feedback.onStart?.();
  });
  element.addEventListener('pointermove', (event) => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y;
    if (!horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      horizontal = true;
      if (feedback.onDrag) {
        try {
          element.setPointerCapture(event.pointerId);
        } catch {}
      }
    }
    if (!horizontal) return;
    distance = dx;
    if (feedback.onDrag && !frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        feedback.onDrag?.(distance);
      });
  });
  element.addEventListener('pointerup', (event) => {
    if (!start || start.id !== event.pointerId) return;
    distance = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const committed =
      Math.abs(distance) >= 35 && Math.abs(distance) >= Math.abs(dy) * 1.3;
    const direction = distance < 0 ? 1 : -1;
    release(committed);
    if (!committed) return;
    swiped = true;
    event.preventDefault();
    onSwipe(direction);
  });
  element.addEventListener(
    'touchend',
    (event) => {
      if (swiped && event.cancelable) event.preventDefault();
    },
    { passive: false },
  );
  element.addEventListener('pointercancel', () => {
    if (start) release(false);
  });
  element.addEventListener('pointerleave', () => {
    if (start && !element.hasPointerCapture(start.id)) release(false);
  });
  element.addEventListener(
    'click',
    (event) => {
      if (!swiped || event.detail === 0) return;
      swiped = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
}
