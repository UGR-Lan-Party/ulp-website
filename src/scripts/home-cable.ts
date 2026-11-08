import { siteMotion } from '../utils/site-motion.js';

const cable = document.querySelector<HTMLElement>('[data-home-cable]');
const home = cable?.closest<HTMLElement>('.home-page');

if (cable && home) {
  const svg = cable.querySelector<SVGSVGElement>('[data-cable-svg]')!;
  const guide = cable.querySelector<SVGPathElement>('[data-cable-guide]')!;
  const layers = cable.querySelectorAll<SVGPathElement>('[data-cable-path]');
  const start = cable.querySelector<SVGUseElement>('[data-cable-start]')!;
  const end = cable.querySelector<SVGUseElement>('[data-cable-end]')!;
  const tip = cable.querySelector<SVGCircleElement>('[data-cable-tip]')!;
  const motion = siteMotion();
  let total = 0;
  let current = 0;
  let target = 0;
  let homeTop = 0;
  let frame = 0;
  let layoutFrame = 0;
  let previousTime = 0;
  let samples: { y: number; length: number }[] = [];

  function draw(time: number) {
    frame = 0;
    const elapsed = previousTime ? Math.min(48, time - previousTime) : 16;
    previousTime = time;
    current = motion.matches
      ? target
      : current + (target - current) * (1 - Math.exp(-elapsed / 95));
    if (Math.abs(target - current) < 0.4) current = target;
    cable!.style.setProperty('--cable-gap', String(1 - current / total));
    cable!.style.setProperty(
      '--cable-complete',
      target === total && current >= total - 0.4 ? '1' : '0',
    );
    const point = guide.getPointAtLength(current);
    tip.setAttribute('cx', String(point.x));
    tip.setAttribute('cy', String(point.y));
    tip.style.opacity =
      current < 0.5 || current >= total - 1 || motion.matches ? '0' : '1';
    if (Math.abs(target - current) > 0.4 && !document.hidden)
      frame = requestAnimationFrame(draw);
    else previousTime = 0;
  }

  function update() {
    if (!total) return;
    // Map both directions to the document's scroll range, including the footer.
    const firstY = samples[0].y;
    const lastY = samples[samples.length - 1].y;
    const startScroll = Math.max(0, homeTop + firstY - innerHeight * 0.86);
    const endScroll = document.documentElement.scrollHeight - innerHeight;
    const progress = Math.max(
      0,
      Math.min(
        1,
        (scrollY - startScroll) / Math.max(1, endScroll - startScroll),
      ),
    );
    const visibleY = firstY + (lastY - firstY) * progress;
    let low = 0;
    let high = samples.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (samples[middle].y < visibleY) low = middle + 1;
      else high = middle;
    }
    const after = samples[low];
    const before = samples[Math.max(0, low - 1)];
    const fraction = Math.max(
      0,
      Math.min(1, (visibleY - before.y) / Math.max(1, after.y - before.y)),
    );
    target =
      progress === 0
        ? 0
        : progress === 1
          ? total
          : before.length + fraction * (after.length - before.length);
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function layout() {
    layoutFrame = 0;
    const bounds = home!.getBoundingClientRect();
    const width = bounds.width;
    const height = home!.offsetHeight;
    if (!width || !height) return;
    homeTop = bounds.top + scrollY;
    const mobile = width <= 700;
    const gutter = mobile ? 5.5 : Math.min(14, Math.max(9, width * 0.009));
    const left = gutter;
    const right = width - gutter;
    const radius = mobile ? 9 : 22;
    const firstSection = home!.querySelector<HTMLElement>('#experiencias');
    const firstTitle = firstSection?.querySelector('h2');
    if (!firstSection || !firstTitle) return;
    const scale = mobile ? 0.62 : 0.85;
    const startY =
      firstTitle.getBoundingClientRect().top - bounds.top + 12 * scale;
    let x = right;
    let y = startY;
    let path = `M ${x} ${y}`;
    const sections = [
      ...home!.querySelectorAll<HTMLElement>(':scope > section'),
    ];

    for (const section of sections.slice(sections.indexOf(firstSection) + 1)) {
      if (section.id === 'home' || section.hidden || !section.offsetHeight)
        continue;
      const top = section.getBoundingClientRect().top - bounds.top;
      const crossing = section.matches(
        '.about-section, .trailer-section, .memory-section',
      );
      const borderTop = parseFloat(getComputedStyle(section).borderTopWidth);
      const previous = section.previousElementSibling;
      const borderBottom = previous
        ? parseFloat(getComputedStyle(previous).borderBottomWidth)
        : 0;
      // Follow the actual divider, including the previous section's bottom border.
      const dividerY = borderTop
        ? top + borderTop / 2
        : borderBottom && previous
          ? previous.getBoundingClientRect().bottom -
            bounds.top -
            borderBottom / 2
          : top;
      const nextY = Math.max(y + 1, dividerY);
      // Straight runs, with rounded elbows only at changes of direction.
      path += ` L ${x} ${nextY - (crossing ? radius : 0)}`;
      if (crossing) {
        const nextX = x === right ? left : right;
        const direction = nextX > x ? 1 : -1;
        path += ` Q ${x} ${nextY}, ${x + direction * radius} ${nextY}`;
        path += ` L ${nextX - direction * radius} ${nextY}`;
        path += ` Q ${nextX} ${nextY}, ${nextX} ${nextY + radius}`;
        x = nextX;
        y = nextY + radius;
      } else y = nextY;
    }
    const endY = height - 28;
    path += ` L ${x} ${endY}`;
    const oldTotal = total;
    guide.setAttribute('d', path);
    layers.forEach((layer) => layer.setAttribute('d', path));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    total = guide.getTotalLength();
    current = oldTotal ? (current / oldTotal) * total : 0;
    samples = Array.from({ length: 513 }, (_, i) => {
      const length = (i / 512) * total;
      return { y: guide.getPointAtLength(length).y, length };
    });
    start.setAttribute(
      'transform',
      `translate(${right} ${startY - 12 * scale}) scale(${scale})`,
    );
    end.setAttribute(
      'transform',
      `translate(${x} ${endY + 12 * scale}) rotate(180) scale(${scale})`,
    );
    cable!.setAttribute('data-ready', '');
    update();
  }

  const resize = new ResizeObserver(() => {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(layout);
  });
  resize.observe(home);
  home
    .querySelectorAll(':scope > section')
    .forEach((section) => resize.observe(section));
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  document.addEventListener('visibilitychange', update);
  motion.addEventListener('change', update);
  document.fonts.ready.then(() => {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(layout);
  });
}
