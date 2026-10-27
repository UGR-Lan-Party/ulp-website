import { siteMotion } from '../utils/site-motion.js';
const card = document.getElementById('holo-card');
const reducedMotion = siteMotion();
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let pointerId = null;
let bounds = null;
let frame = 0;

function tiltCard(event) {
  if (!card || reducedMotion.matches) return;
  if (
    event.pointerType === 'touch'
      ? event.pointerId !== pointerId
      : !finePointer.matches
  )
    return;
  bounds ??= card.getBoundingClientRect();
  const x = Math.max(
    -1,
    Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1),
  );
  const y = Math.max(
    -1,
    Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1),
  );
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    card.classList.remove('holo-animation');
    card.style.setProperty('--holo-x', `${(x + 1) * 50}%`);
    card.style.setProperty('--holo-y', `${(y + 1) * 50}%`);
    card.style.transform = `perspective(1500px) rotate3d(${y}, ${-x}, 0, ${Math.min(Math.hypot(x, y), 1) * 12}deg)`;
  });
}

function resetCard() {
  cancelAnimationFrame(frame);
  pointerId = null;
  bounds = null;
  if (!card) return;
  card.style.removeProperty('transform');
  card.style.removeProperty('--holo-x');
  card.style.removeProperty('--holo-y');
  card.classList.toggle(
    'holo-animation',
    !reducedMotion.matches && finePointer.matches,
  );
}

card?.addEventListener('pointerdown', (event) => {
  if (
    event.pointerType !== 'touch' ||
    !event.isPrimary ||
    reducedMotion.matches
  )
    return;
  pointerId = event.pointerId;
  bounds = card.getBoundingClientRect();
  card.setPointerCapture(pointerId);
  tiltCard(event);
});
card?.addEventListener('pointermove', tiltCard);
card?.addEventListener('pointerup', (event) => {
  if (event.pointerId === pointerId) resetCard();
});
card?.addEventListener('pointerleave', resetCard);
card?.addEventListener('pointercancel', resetCard);
card?.addEventListener('lostpointercapture', resetCard);
reducedMotion.addEventListener('change', resetCard);
finePointer.addEventListener('change', resetCard);
window.addEventListener('blur', resetCard);
resetCard();
