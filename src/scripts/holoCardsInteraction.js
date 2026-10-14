const card = document.getElementById('holo-card');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
card?.addEventListener('mousemove', (event) => {
  if (reducedMotion.matches) return;
  const box = card.getBoundingClientRect();
  const x = (event.clientX - box.left - box.width / 2) / (box.width / 2);
  const y = (event.clientY - box.top - box.height / 2) / (box.height / 2);
  card.classList.remove('holo-animation');
  card.style.transform = `perspective(1500px) rotate3d(${y}, ${-x}, 0, ${Math.min(Math.hypot(x, y), 1) * 10}deg)`;
});
function resetCard() {
  if (!card) return;
  card.style.removeProperty('transform');
  card.classList.toggle('holo-animation', !reducedMotion.matches);
}
card?.addEventListener('mouseleave', resetCard);
reducedMotion.addEventListener('change', resetCard);
resetCard();
