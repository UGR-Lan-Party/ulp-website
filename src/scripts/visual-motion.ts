const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      if (!reducedMotion.matches) {
        entry.target.animate(
          [
            { opacity: 0, transform: 'translateY(28px)', filter: 'blur(5px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
          ],
          { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      }
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.08 },
);
document
  .querySelectorAll('[data-reveal]')
  .forEach((element) => observer.observe(element));

document
  .querySelectorAll<HTMLElement>('[data-spotlight]')
  .forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches || event.pointerType === 'touch') return;
      const box = element.getBoundingClientRect();
      element.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
      element.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
    });
  });
const backToTop = document.querySelector<HTMLElement>('.back-to-top');
if (backToTop) {
  const update = () => {
    backToTop.style.display = scrollY > 600 ? 'flex' : 'none';
  };
  addEventListener('scroll', update, { passive: true });
  backToTop.addEventListener('click', () =>
    scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    }),
  );
  update();
}
export {};
