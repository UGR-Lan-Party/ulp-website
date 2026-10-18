import { getCountdown } from '../utils/countdown.js';

document.addEventListener('DOMContentLoaded', () => {
  const countdown = document.getElementById('countdown');
  if (!countdown) return;
  let timer;
  const update = () => {
    const remaining = getCountdown(countdown.dataset.startsAt);
    if (!remaining) {
      countdown.hidden = true;
      clearInterval(timer);
      return;
    }
    for (const [id, value] of Object.entries(remaining)) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }
  };
  update();
  if (!countdown.hidden) timer = setInterval(update, 1000);
});
