const finePointer = matchMedia('(pointer: fine)');
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
      if (element.matches('[data-partner-card]') && finePointer.matches) {
        const x = Math.max(
          -0.5,
          Math.min(0.5, (event.clientX - box.left) / box.width - 0.5),
        );
        const y = Math.max(
          -0.5,
          Math.min(0.5, (event.clientY - box.top) / box.height - 0.5),
        );
        element.style.setProperty('--logo-tilt-x', `${-y * 8}deg`);
        element.style.setProperty('--logo-tilt-y', `${x * 10}deg`);
        element.style.setProperty('--logo-depth', '10px');
      }
    });
    const resetLogo = () => {
      ['--logo-tilt-x', '--logo-tilt-y', '--logo-depth'].forEach((property) =>
        element.style.removeProperty(property),
      );
    };
    element.addEventListener('pointerleave', resetLogo);
    reducedMotion.addEventListener('change', resetLogo);
    finePointer.addEventListener('change', resetLogo);
  });
const header = document.querySelector<HTMLElement>('.ud-header');
const backToTop = document.querySelector<HTMLElement>('.back-to-top');
const footerCredits = document.querySelector<HTMLElement>('.footer-copyright');
function updateScrollState() {
  header?.classList.toggle('is-scrolled', scrollY > 32);
  if (backToTop) {
    backToTop.style.display = scrollY > 600 ? 'flex' : 'none';
    const creditsTop =
      footerCredits?.getBoundingClientRect().top ?? innerHeight;
    backToTop.style.bottom = `${innerWidth <= 700 ? Math.max(24, innerHeight - creditsTop + 12) : 24}px`;
  }
}
addEventListener('scroll', updateScrollState, { passive: true });
addEventListener('pageshow', updateScrollState);
addEventListener('resize', updateScrollState);
backToTop?.addEventListener('click', () =>
  scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }),
);
updateScrollState();
export {};
