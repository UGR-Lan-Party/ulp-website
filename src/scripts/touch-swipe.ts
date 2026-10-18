export function enableTouchSwipe(
  element: HTMLElement,
  onSwipe: (direction: -1 | 1) => void,
) {
  let start: { id: number; x: number; y: number } | null = null;
  let swiped = false;
  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch' || !event.isPrimary) return;
    swiped = false;
    start = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  element.addEventListener('pointerup', (event) => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    swiped = true;
    event.preventDefault();
    onSwipe(dx < 0 ? 1 : -1);
  });
  element.addEventListener(
    'touchend',
    (event) => {
      if (swiped && event.cancelable) event.preventDefault();
    },
    { passive: false },
  );
  element.addEventListener('pointercancel', () => {
    start = null;
  });
  element.addEventListener('pointerleave', () => {
    start = null;
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
