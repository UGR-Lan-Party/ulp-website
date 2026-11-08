import { siteMotion } from '../utils/site-motion.js';

document
  .querySelectorAll<HTMLElement>('[data-logo-assembly]')
  .forEach((logo) => {
    const pieces = [
      ...logo.querySelectorAll<SVGPathElement>('[data-logo-piece]'),
    ];
    const blueprint = logo.querySelector<SVGPathElement>(
      '[data-logo-blueprint]',
    )!;
    const motion = siteMotion();
    let animations: Animation[] = [];
    let played = false;

    async function assemble() {
      if (played) return;
      played = true;
      if (motion.matches) {
        logo.dataset.logoAssembled = 'true';
        return;
      }
      logo.dataset.logoPlaying = 'true';
      const ordered = pieces
        .map((piece) => ({ piece, bounds: piece.getBBox() }))
        .sort(
          (a, b) =>
            b.bounds.width * b.bounds.height - a.bounds.width * a.bounds.height,
        );
      animations = ordered.map(({ piece, bounds }, index) => {
        const x = bounds.x + bounds.width / 2 - 990;
        const y = bounds.y + bounds.height / 2 - 1000;
        const distance = Math.hypot(x, y) || 1;
        const travel = Math.max(
          45,
          Math.min(100, Math.sqrt(bounds.width * bounds.height) * 0.12),
        );
        const dx = (x / distance) * travel;
        const dy = (y / distance) * travel;
        // Each path is clipped to its own fixed slot: it cannot cover a neighbour.
        return piece.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
            {
              transform: `translate(${dx * 0.08}px, ${dy * 0.08}px)`,
              opacity: 1,
              offset: 0.62,
            },
            { transform: 'translate(0, 0)', opacity: 1 },
          ],
          {
            duration: 850,
            delay: index * 55,
            easing: 'cubic-bezier(0.22, 0.8, 0.3, 1)',
            fill: 'backwards',
          },
        );
      });
      animations.push(
        blueprint.animate(
          [
            { strokeDashoffset: '1', opacity: 0 },
            { opacity: 0.18, offset: 0.15 },
            { strokeDashoffset: '0', opacity: 0.1, offset: 0.7 },
            { strokeDashoffset: '0', opacity: 0 },
          ],
          { duration: 1550, easing: 'ease-in-out' },
        ),
      );
      await Promise.allSettled(
        animations.map((animation) => animation.finished),
      );
      delete logo.dataset.logoPlaying;
      logo.dataset.logoAssembled = 'true';
    }

    motion.addEventListener('change', () => {
      if (motion.matches) animations.forEach((animation) => animation.cancel());
    });
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          assemble();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(logo);
  });
