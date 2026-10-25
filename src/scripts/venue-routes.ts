import { findVenueRoute, getVenueRoutePath } from '../utils/venue-routing';
import { venuePlans } from '../data/venue-map.ts';
import type { VenuePlanId } from '../data/venue-map.ts';

export function createVenueRoutes(
  map: HTMLElement,
  navigate: (plan: VenuePlanId) => void,
  current: () => VenuePlanId,
) {
  const form = map.querySelector<HTMLFormElement>('[data-route-form]')!;
  const origin = form.querySelector<HTMLSelectElement>('[data-route-origin]')!,
    destination = form.querySelector<HTMLSelectElement>(
      '[data-route-destination]',
    )!;
  const layer = map.querySelector<SVGGElement>('[data-route-layer]')!;
  const error = map.querySelector<HTMLElement>('[data-route-error]')!,
    result = map.querySelector<HTMLElement>('[data-route-result]')!;
  const steps = map.querySelector<HTMLOListElement>('[data-route-steps]')!,
    play = map.querySelector<HTMLButtonElement>('[data-route-play]')!,
    previous = map.querySelector<HTMLButtonElement>('[data-route-previous]')!,
    next = map.querySelector<HTMLButtonElement>('[data-route-next]')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let route: ReturnType<typeof findVenueRoute> = null,
    index = 0,
    timer: ReturnType<typeof setTimeout> | undefined,
    frame = 0,
    playing = false;
  const planName = (id: string) => {
    const p = venuePlans.find((p) => p.id === id)!;
    return `${p.buildingLabel} · ${p.floor}`;
  };
  const svg = (tag: string, attributes: Record<string, string>) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    el.setAttribute('vector-effect', 'non-scaling-stroke');
    for (const [key, value] of Object.entries(attributes))
      el.setAttribute(key, value);
    return el;
  };
  function stop() {
    if (timer) clearTimeout(timer);
    timer = undefined;
    playing = false;
    play.textContent = 'Reproducir recorrido';
  }
  function paint(animate = false) {
    cancelAnimationFrame(frame);
    layer.replaceChildren();
    if (!route) return;
    let segment = route.segments[index];
    if (segment.plan !== current()) return;
    if (current() === 'recinto' && route.overviewPoints.length > 1)
      segment = { ...segment, points: route.overviewPoints };
    const d = getVenueRoutePath(segment.points);
    if (segment.points.length > 1) {
      layer.append(
        svg('path', {
          d,
          fill: 'none',
          stroke: 'var(--venue-plan-background, var(--paper))',
          'stroke-width': '9',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        }),
      );
      const line = svg('path', {
        d,
        fill: 'none',
        stroke: 'var(--venue-route-color, #007b80)',
        'stroke-width': '4',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }) as SVGPathElement;
      layer.append(line);
      if (animate && !motion.matches) {
        const length = line.getTotalLength();
        line.animate(
          [
            { strokeDasharray: `${length}`, strokeDashoffset: length },
            { strokeDasharray: `${length}`, strokeDashoffset: 0 },
          ],
          { duration: 1500, easing: 'ease-in-out' },
        );
        const dot = svg('circle', {
          r: '5',
          fill: '#f5f0e6',
          stroke: '#006471',
          'stroke-width': '2',
        });
        layer.append(dot);
        let start = 0;
        const animate = (time: number) => {
          if (!start) start = time;
          const progress = Math.min(1, (time - start) / 1500);
          const point = line.getPointAtLength(length * progress);
          dot.setAttribute('cx', String(point.x));
          dot.setAttribute('cy', String(point.y));
          if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      }
    }
    const first = segment.points[0],
      last = segment.points.at(-1)!;
    layer.append(
      svg('circle', {
        cx: String(first.x),
        cy: String(first.y),
        r: '5',
        fill: '#f5f0e6',
        stroke: '#006471',
        'stroke-width': '2',
      }),
    );
    layer.append(
      svg('circle', {
        cx: String(last.x),
        cy: String(last.y),
        r: '6',
        fill: '#006471',
        stroke: '#f5f0e6',
        'stroke-width': '2',
      }),
    );
  }
  function show(at: number) {
    if (!route) return;
    index = Math.max(0, Math.min(at, route.segments.length - 1));
    const segment = route.segments[index];
    navigate(segment.plan as VenuePlanId);
    paint(true);
    map.querySelector('[data-route-progress]')!.textContent =
      `Tramo ${index + 1} de ${route.segments.length}`;
    map.querySelector('[data-route-title]')!.textContent = planName(
      segment.plan,
    );
    map.querySelector('[data-route-instruction]')!.textContent =
      (segment.transition === 'stairs' ? 'Por las escaleras. ' : '') +
      (index === route.segments.length - 1
        ? `Llegada: ${route.destination.label}`
        : (segment.arrival ?? ''));
    const upcoming = route.segments[index + 1];
    const level = (plan: string) =>
      plan === 'principal-baja' ? -1 : plan === 'aulario-1' ? 1 : 0;
    const floorChange = upcoming?.transition === 'stairs';
    const movement = floorChange
      ? level(upcoming.plan) > level(segment.plan)
        ? 'Sube'
        : 'Baja'
      : '';
    const upcomingPanel = map.querySelector<HTMLElement>(
      '[data-route-upcoming]',
    )!;
    upcomingPanel.hidden = !upcoming;
    map.querySelector('[data-route-upcoming-title]')!.textContent = upcoming
      ? planName(upcoming.plan)
      : '';
    if (floorChange)
      map.querySelector('[data-route-instruction]')!.textContent =
        `${movement} por las escaleras a ${venuePlans.find((p) => p.id === upcoming.plan)!.floor.toLocaleLowerCase('es')}.`;
    steps.querySelectorAll('button').forEach((button, i) => {
      button.toggleAttribute('aria-current', i === index);
      button.toggleAttribute('data-upcoming', i === index + 1);
      if (i === index) button.setAttribute('aria-current', 'step');
    });
    const activeStep = steps.querySelector<HTMLElement>(
      '[aria-current="step"]',
    );
    if (activeStep) {
      const activeBounds = activeStep.getBoundingClientRect(),
        bounds = steps.getBoundingClientRect();
      if (activeBounds.right > bounds.right)
        steps.scrollLeft += activeBounds.right - bounds.right + 4;
      if (activeBounds.left < bounds.left)
        steps.scrollLeft -= bounds.left - activeBounds.left + 4;
    }
    map.dataset.routeOrigin = origin.value;
    map.dataset.routeDestination = destination.value;
    map.dataset.routeStep = String(index);
    previous.disabled = index === 0;
    next.disabled = index === route.segments.length - 1;
  }
  function advance() {
    if (!route) return;
    if (index >= route.segments.length - 1) {
      stop();
      return;
    }
    show(index + 1);
    timer = setTimeout(advance, 4200);
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    stop();
    error.hidden = true;
    delete map.dataset.routeOrigin;
    delete map.dataset.routeDestination;
    delete map.dataset.routeStep;
    route = findVenueRoute(origin.value, destination.value);
    if (!route) {
      layer.replaceChildren();
      result.hidden = true;
      error.hidden = false;
      error.textContent =
        origin.value === destination.value
          ? 'Elige dos ubicaciones distintas.'
          : 'No hay un recorrido disponible entre estas ubicaciones.';
      return;
    }
    result.hidden = false;
    steps.replaceChildren(
      ...route.segments.map((segment: { plan: string }, i: number) => {
        const li = document.createElement('li'),
          button = document.createElement('button');
        button.type = 'button';
        const plan = venuePlans.find((p) => p.id === segment.plan)!;
        const building = document.createElement('small');
        building.textContent = plan.buildingLabel.replace('Edificio ', '');
        const floor = document.createElement('span');
        floor.textContent = `${i + 1}. ${plan.floor}`;
        button.append(building, floor);
        button.addEventListener('click', () => {
          stop();
          show(i);
        });
        li.append(button);
        return li;
      }),
    );
    show(0);
  });
  map.querySelector('[data-route-swap]')!.addEventListener('click', () => {
    const value = origin.value;
    origin.value = destination.value;
    destination.value = value;
    if (route) form.requestSubmit();
  });
  previous.addEventListener('click', () => {
    stop();
    show(index - 1);
  });
  next.addEventListener('click', () => {
    stop();
    show(index + 1);
  });
  play.addEventListener('click', () => {
    if (playing) {
      stop();
      return;
    }
    if (!route) return;
    playing = true;
    play.textContent = 'Pausar recorrido';
    show(index === route.segments.length - 1 ? 0 : index);
    timer = setTimeout(advance, 4200);
  });
  map.querySelector('[data-route-close]')!.addEventListener('click', () => {
    stop();
    route = null;
    delete map.dataset.routeOrigin;
    delete map.dataset.routeDestination;
    delete map.dataset.routeStep;
    cancelAnimationFrame(frame);
    layer.replaceChildren();
    result.hidden = true;
  });
  map
    .querySelector<HTMLDetailsElement>('[data-route-panel]')!
    .addEventListener('toggle', (event) => {
      if (!(event.currentTarget as HTMLDetailsElement).open) stop();
    });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      stop();
      paint();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });
  const params = new URLSearchParams(location.search);
  const from = params.get('desde'),
    to = params.get('hasta');
  if (
    Array.from(origin.options).some((o) => o.value === from) &&
    Array.from(destination.options).some((o) => o.value === to)
  ) {
    origin.value = from!;
    destination.value = to!;
    form.requestSubmit();
    const step = Number(params.get('tramo'));
    if (Number.isInteger(step) && step >= 0) show(step);
  }
  return {
    clear() {
      stop();
      route = null;
      delete map.dataset.routeOrigin;
      delete map.dataset.routeDestination;
      delete map.dataset.routeStep;
      cancelAnimationFrame(frame);
      layer.replaceChildren();
      result.hidden = true;
    },
    refresh() {
      if (route && route.segments[index].plan !== current()) stop();
      paint();
    },
  };
}
