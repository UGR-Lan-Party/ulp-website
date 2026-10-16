const card = document.getElementById('holo-card');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
card?.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || !finePointer.matches) return;
  const box = card.getBoundingClientRect();
  const x = (event.clientX - box.left - box.width / 2) / (box.width / 2);
  const y = (event.clientY - box.top - box.height / 2) / (box.height / 2);
  card.classList.remove('holo-animation');
  card.style.setProperty('--holo-x', `${(x + 1) * 50}%`);
  card.style.setProperty('--holo-y', `${(y + 1) * 50}%`);
  card.style.transform = `perspective(1500px) rotate3d(${y}, ${-x}, 0, ${Math.min(Math.hypot(x, y), 1) * 10}deg)`;
});
function resetCard() {
  if (!card) return;
  card.style.removeProperty('transform');
  card.style.removeProperty('--holo-x');
  card.style.removeProperty('--holo-y');
  card.classList.toggle(
    'holo-animation',
    !reducedMotion.matches && finePointer.matches,
  );
}
card?.addEventListener('pointerleave', resetCard);
reducedMotion.addEventListener('change', resetCard);
finePointer.addEventListener('change', resetCard);
resetCard();
