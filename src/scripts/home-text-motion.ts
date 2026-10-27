import { siteMotion, scrollEntryMotion } from '../utils/site-motion.js';
const motionPreference = siteMotion();
const scrollEntries = scrollEntryMotion();
const hero = document.querySelector<HTMLElement>('#home');
const driftItems = Array.from(
  document.querySelectorAll<HTMLElement>('[data-home-drift]'),
).map((element) => ({
  element,
  distance: Math.max(-48, Math.min(48, Number(element.dataset.homeDrift) || 0)),
}));
const animations = new Set<Animation>();
const visibleHeadings = new WeakSet<Element>();
let scrollFrame = 0;

function updateDrift() {
  scrollFrame = 0;
  if (!hero || document.hidden || motionPreference.matches) return;
  const bounds = hero.getBoundingClientRect();
  if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
  const progress = Math.max(0, Math.min(1, -bounds.top / bounds.height));
  const scale = innerWidth < 700 ? 0.28 : 1;
  driftItems.forEach(({ element, distance }) => {
    element.style.setProperty(
      '--home-text-x',
      `${distance * progress * scale}px`,
    );
  });
}

function scheduleDrift() {
  if (!scrollFrame && !motionPreference.matches && !document.hidden) {
    scrollFrame = requestAnimationFrame(updateDrift);
  }
}

const playedHeadings = new WeakSet<Element>();
function revealHeading(heading: Element) {
  playedHeadings.add(heading);
  if (motionPreference.matches) return;
  heading
    .querySelectorAll<HTMLElement>('[data-text-word]')
    .forEach((word, index) => {
      const animation = word.animate(
        [
          {
            opacity: 0.15,
            transform: 'translate3d(-24px, 18px, 0) rotate(-3deg)',
            filter: 'blur(5px)',
          },
          {
            opacity: 1,
            transform: 'translate3d(0, 0, 0) rotate(0deg)',
            filter: 'blur(0)',
          },
        ],
        {
          duration: 800,
          delay: index * 85,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        },
      );
      animations.add(animation);
      animation.onfinish = animation.oncancel = () =>
        animations.delete(animation);
    });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.25) {
        if (scrollEntries.matches) {
          visibleHeadings.delete(entry.target);
          entry.target
            .getAnimations({ subtree: true })
            .forEach((animation) => animation.cancel());
        }
        return;
      }
      if (
        visibleHeadings.has(entry.target) ||
        (!scrollEntries.matches && playedHeadings.has(entry.target))
      )
        return;
      visibleHeadings.add(entry.target);
      revealHeading(entry.target);
      if (!scrollEntries.matches) revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.25, rootMargin: '0px 0px -8% 0px' },
);

document.querySelectorAll('[data-home-text-reveal]').forEach((heading) => {
  revealObserver.observe(heading);
});
scrollEntries.addEventListener('change', () => {
  if (!scrollEntries.matches)
    animations.forEach((animation) => animation.cancel());
});
addEventListener('scroll', scheduleDrift, { passive: true });
addEventListener('resize', scheduleDrift, { passive: true });
addEventListener('pageshow', scheduleDrift);
document.addEventListener('visibilitychange', scheduleDrift);
motionPreference.addEventListener('change', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = 0;
  animations.forEach((animation) => animation.cancel());
  driftItems.forEach(({ element }) =>
    element.style.removeProperty('--home-text-x'),
  );
  scheduleDrift();
});
scheduleDrift();
export {};
