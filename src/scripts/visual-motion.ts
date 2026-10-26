import { siteMotion, scrollEntryMotion } from '../utils/site-motion.js';
const finePointer = matchMedia('(pointer: fine)');
const reducedMotion = siteMotion();
const scrollEntries = scrollEntryMotion();
const entryAnimations = new Set<Animation>();
const revealed = new WeakSet<Element>();
const revealElements = document.querySelectorAll('[data-reveal]');
function reveal(element: Element) {
  if (revealed.has(element)) return;
  revealed.add(element);
  if (reducedMotion.matches) return;
  const animation = element.animate(
    [
      scrollEntries.matches
        ? { opacity: 0, transform: 'translateY(28px)', filter: 'blur(5px)' }
        : { opacity: 1, transform: 'translateY(28px)' },
      scrollEntries.matches
        ? { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
        : { opacity: 1, transform: 'translateY(0)' },
    ],
    { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  );
  entryAnimations.add(animation);
  animation.onfinish = animation.oncancel = () =>
    entryAnimations.delete(animation);
}
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.08 },
);
revealElements.forEach((element) => {
  observer.observe(element);
});
scrollEntries.addEventListener('change', () => {
  if (!scrollEntries.matches) {
    entryAnimations.forEach((animation) => animation.cancel());
  }
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches)
    entryAnimations.forEach((animation) => animation.cancel());
});

document
  .querySelectorAll<HTMLElement>('[data-spotlight]')
  .forEach((element) => {
    let frame = 0,
      x = 0,
      y = 0;
    const paint = () => {
      frame = 0;
      if (reducedMotion.matches || !finePointer.matches || document.hidden)
        return;
      const box = element.getBoundingClientRect();
      element.style.setProperty('--pointer-x', `${x - box.left}px`);
      element.style.setProperty('--pointer-y', `${y - box.top}px`);
      if (element.matches('[data-partner-card]')) {
        const dx = Math.max(
          -0.5,
          Math.min(0.5, (x - box.left) / box.width - 0.5),
        );
        const dy = Math.max(
          -0.5,
          Math.min(0.5, (y - box.top) / box.height - 0.5),
        );
        element.style.setProperty('--logo-tilt-x', `${-dy * 8}deg`);
        element.style.setProperty('--logo-tilt-y', `${dx * 10}deg`);
        element.style.setProperty('--logo-depth', '10px');
      }
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      [
        '--pointer-x',
        '--pointer-y',
        '--logo-tilt-x',
        '--logo-tilt-y',
        '--logo-depth',
      ].forEach((property) => element.style.removeProperty(property));
    };
    element.addEventListener('pointermove', (event) => {
      if (
        reducedMotion.matches ||
        !finePointer.matches ||
        event.pointerType === 'touch'
      )
        return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    });
    element.addEventListener('pointerleave', reset);
    reducedMotion.addEventListener('change', reset);
    finePointer.addEventListener('change', reset);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) reset();
    });
  });
const header = document.querySelector<HTMLElement>('.ud-header');
const backToTop = document.querySelector<HTMLElement>('.back-to-top');
const footerCredits = document.querySelector<HTMLElement>('.footer-copyright');
let scrollFrame = 0;
function updateScrollState() {
  scrollFrame = 0;
  header?.classList.toggle('is-scrolled', scrollY > 32);
  if (backToTop) {
    backToTop.style.display = scrollY > 600 ? 'flex' : 'none';
    const creditsTop =
      footerCredits?.getBoundingClientRect().top ?? innerHeight;
    backToTop.style.bottom = `${innerWidth <= 700 ? Math.max(24, innerHeight - creditsTop + 12) : 24}px`;
  }
}
function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
}
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll, { passive: true });
addEventListener('pageshow', scheduleScroll);
backToTop?.addEventListener('click', () =>
  scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }),
);
updateScrollState();
