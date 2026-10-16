import {
  venuePlans,
  venueZones,
  venueLayouts,
  getVenueZones,
} from '../data/venue-map';
import type { VenuePlanId, VenueOrientation } from '../data/venue-map';

export function createVenueMap(
  root: HTMLElement,
  onZoneChange: (id: string | null) => void,
) {
  const map = root.querySelector<HTMLElement>('[data-venue-map]');
  if (!map) return { update: (_indices: number[]) => {}, clear: () => {} };
  const drawing = map.querySelector<SVGSVGElement>('[data-venue-drawing]')!;
  const building = map.querySelector<SVGGElement>('[data-venue-building]')!;
  const indicators = map.querySelector<SVGGElement>('[data-venue-indicators]')!;
  const buildingSelect = map.querySelector<HTMLSelectElement>(
    '[data-venue-building-select]',
  )!;
  const floorSelect = map.querySelector<HTMLSelectElement>(
    '[data-venue-floor-select]',
  )!;
  const status = map.querySelector<HTMLElement>('[data-venue-selection]')!;
  const viewStatus = map.querySelector<HTMLElement>(
    '[data-venue-view-status]',
  )!;
  const entries = Array.from(
    root.querySelectorAll<HTMLElement>('[data-program-row]'),
  ).map((row) => getVenueZones(row.dataset.location ?? ''));
  const zones = Array.from(
    map.querySelectorAll<SVGGElement>('[data-venue-zone]'),
  );
  const plans = Array.from(
    map.querySelectorAll<SVGGElement>('[data-venue-floor-plan]'),
  );
  const clearButton =
    map.querySelector<HTMLButtonElement>('[data-venue-clear]')!;
  const orientationButtons = Array.from(
    map.querySelectorAll<HTMLButtonElement>('[data-venue-orientation]'),
  );
  const rotationButtons = Array.from(
    map.querySelectorAll<HTMLButtonElement>(
      '[data-venue-rotate], [data-venue-orientation]',
    ),
  );
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let planId: VenuePlanId = 'principal-0';
  let orientation: VenueOrientation = 0;
  let activeZone: string | null = null;
  let counts = new Map<string, number>();
  let turnVersion = 0;
  let turning = false;
  let pointer: { id: number; x: number } | null = null;

  function syncControls() {
    const plan = venuePlans.find((plan) => plan.id === planId)!;
    buildingSelect.disabled = false;
    buildingSelect.value = plan.building;
    const floors = venuePlans.filter((item) => item.building === plan.building);
    if (floorSelect.options[0]?.value !== floors[0].id) {
      floorSelect.replaceChildren(
        ...floors.map((floor) => new Option(floor.floor, floor.id)),
      );
    }
    floorSelect.value = planId;
    floorSelect.disabled = floors.length === 1;
    orientationButtons.forEach((button, index) =>
      button.setAttribute('aria-pressed', String(index === orientation)),
    );
    rotationButtons.forEach((button) => (button.disabled = turning));
    map!.dataset.venuePlan = planId;
    map!.dataset.orientation = String(orientation);
    viewStatus.textContent = `${plan.buildingLabel}, ${plan.floor}, orientación ${orientation + 1}`;
  }

  function draw() {
    plans.forEach((plan) =>
      plan.toggleAttribute(
        'data-hidden',
        plan.dataset.venueFloorPlan !== planId,
      ),
    );
    building.style.transform = `rotate(${orientation * 90}deg)`;
    const layout = venueLayouts[planId][orientation];
    zones.forEach((zone) => {
      const point = layout.find((point) => point.id === zone.dataset.venueZone);
      const count = counts.get(zone.dataset.venueZone!) ?? 0;
      const hidden = !point || count === 0;
      zone.toggleAttribute('data-hidden', hidden);
      zone.setAttribute('aria-hidden', String(hidden));
      zone.setAttribute('tabindex', hidden ? '-1' : '0');
      if (!point) return;
      zone
        .querySelector('[data-venue-label]')!
        .setAttribute(
          'transform',
          `translate(${point.labelX} ${point.labelY})`,
        );
      zone
        .querySelector('[data-venue-leader]')!
        .setAttribute(
          'd',
          `M${point.edgeX} ${point.labelY + 20}L${point.x} ${point.y}`,
        );
      zone
        .querySelector('[data-venue-point]')!
        .setAttribute('cx', String(point.x));
      zone
        .querySelector('[data-venue-point]')!
        .setAttribute('cy', String(point.y));
    });
    syncControls();
  }

  function stopTurn() {
    turnVersion++;
    building.getAnimations().forEach((animation) => animation.cancel());
    indicators.getAnimations().forEach((animation) => animation.cancel());
    indicators.style.opacity = '1';
    turning = false;
    map!.setAttribute('aria-busy', 'false');
  }

  function setPlan(id: VenuePlanId) {
    stopTurn();
    planId = id;
    draw();
  }

  async function turn(next: number) {
    const target = ((next + 4) % 4) as VenueOrientation;
    if (turning || target === orientation) return;
    const previous = orientation;
    orientation = target;
    if (reducedMotion.matches) {
      draw();
      return;
    }
    const version = ++turnVersion;
    turning = true;
    map!.setAttribute('aria-busy', 'true');
    syncControls();
    let delta = target - previous;
    if (delta > 2) delta -= 4;
    if (delta < -2) delta += 4;
    try {
      await indicators.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 90,
        fill: 'forwards',
      }).finished;
      if (version !== turnVersion) return;
      await building.animate(
        [
          { transform: `rotate(${previous * 90}deg)` },
          { transform: `rotate(${(previous + delta) * 90}deg)` },
        ],
        { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)' },
      ).finished;
      if (version !== turnVersion) return;
      draw();
      indicators.getAnimations().forEach((animation) => animation.cancel());
      await indicators.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 150,
      }).finished;
    } catch {}
    if (version !== turnVersion) return;
    turning = false;
    map!.setAttribute('aria-busy', 'false');
    syncControls();
  }

  function selectZones(ids: string[]) {
    zones.forEach((zone) => {
      const selected = ids.includes(zone.dataset.venueZone!);
      zone.classList.toggle('is-selected', selected);
      zone.setAttribute('aria-pressed', String(selected));
    });
  }

  function clear() {
    activeZone = null;
    clearButton.hidden = true;
    status.hidden = true;
    selectZones([]);
  }

  zones.forEach((zone) => {
    const choose = () => {
      const next =
        activeZone === zone.dataset.venueZone ? null : zone.dataset.venueZone!;
      clear();
      activeZone = next;
      clearButton.hidden = !next;
      selectZones(next ? [next] : []);
      if (next) {
        status.hidden = false;
        status.textContent = `Zona: ${zone.querySelector('text')!.textContent}.`;
      }
      onZoneChange(next);
    };
    zone.addEventListener('click', choose);
    zone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        choose();
      }
    });
  });
  clearButton.addEventListener('click', () => {
    clear();
    onZoneChange(null);
  });
  buildingSelect.addEventListener('change', () => {
    const plan = venuePlans.find(
      (plan) => plan.building === buildingSelect.value,
    );
    if (plan) setPlan(plan.id);
  });
  floorSelect.addEventListener('change', () => {
    const plan = venuePlans.find((plan) => plan.id === floorSelect.value);
    if (plan) setPlan(plan.id);
  });
  map.querySelector<HTMLElement>('[data-venue-controls]')!.hidden = false;
  rotationButtons.forEach((button) =>
    button.addEventListener('click', () => {
      void turn(
        button.dataset.venueOrientation !== undefined
          ? Number(button.dataset.venueOrientation)
          : orientation + Number(button.dataset.venueRotate),
      );
    }),
  );
  drawing.addEventListener('keydown', (event) => {
    if (
      event.target !== drawing ||
      !['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)
    )
      return;
    event.preventDefault();
    void turn(
      event.key === 'Home'
        ? 0
        : orientation + (event.key === 'ArrowLeft' ? -1 : 1),
    );
  });
  drawing.addEventListener('pointerdown', (event) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      (event.target as Element).closest('[data-venue-zone]')
    )
      return;
    pointer = { id: event.pointerId, x: event.clientX };
    drawing.setPointerCapture(event.pointerId);
  });
  drawing.addEventListener('pointerup', (event) => {
    if (pointer?.id !== event.pointerId) return;
    const distance = event.clientX - pointer.x;
    pointer = null;
    if (Math.abs(distance) > 40)
      void turn(orientation + (distance > 0 ? 1 : -1));
  });
  drawing.addEventListener('pointercancel', () => (pointer = null));
  drawing.addEventListener('lostpointercapture', () => (pointer = null));
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stopTurn();
      draw();
    }
  });
  const narrow = matchMedia('(max-width: 600px)');
  const resize = () =>
    drawing.setAttribute(
      'viewBox',
      narrow.matches ? '170 65 580 570' : '0 45 920 625',
    );
  narrow.addEventListener('change', resize);
  resize();
  draw();

  return {
    clear,
    update(indices: number[]) {
      const visible = new Set(indices);
      counts = new Map();
      entries.forEach((ids, index) => {
        if (!visible.has(index)) return;
        for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
      });
      if (
        !venueZones.some((zone) => zone.plan === planId && counts.has(zone.id))
      ) {
        const plan = venuePlans.find((plan) =>
          venueZones.some(
            (zone) => zone.plan === plan.id && counts.has(zone.id),
          ),
        );
        if (plan) planId = plan.id;
      }
      stopTurn();
      draw();
    },
  };
}
