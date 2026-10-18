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
  const rotationButtons = Array.from(
    map.querySelectorAll<HTMLButtonElement>('[data-venue-rotate]'),
  );
  const narrow = matchMedia('(max-width: 600px)');
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let pointer: {
    id: number;
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null = null;
  let suppressClickUntil = 0;
  let dragged = false;
  let pinch: { distance: number; zoom: number } | null = null;
  const zoomButtons = Array.from(
    map.querySelectorAll<HTMLButtonElement>('[data-venue-zoom]'),
  );
  const zoomValue = map.querySelector<HTMLElement>('[data-venue-zoom-value]')!;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const floorNotes = Array.from(
    map.querySelectorAll<HTMLElement>('[data-venue-floor-note]'),
  );
  let planId: VenuePlanId = 'principal-0';
  let orientation: VenueOrientation = 0;
  let activeZone: string | null = null;
  let counts = new Map<string, number>();
  let turnVersion = 0;
  let turning = false;

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
    rotationButtons.forEach((button) => (button.disabled = turning));
    map!.dataset.venuePlan = planId;
    map!.dataset.orientation = String(orientation);
    viewStatus.textContent = `${plan.buildingLabel}, ${plan.floor}, orientación ${orientation + 1}`;
  }

  function draw() {
    floorNotes.forEach(
      (note) => (note.hidden = note.dataset.venueFloorNote !== planId),
    );
    map!.style.setProperty('--venue-label-turn', `${-orientation * 90}deg`);
    plans.forEach((plan) =>
      plan.toggleAttribute(
        'data-hidden',
        plan.dataset.venueFloorPlan !== planId,
      ),
    );
    building.style.transform = `rotate(${orientation * 90}deg)`;
    const layout = venueLayouts[planId][orientation];
    const view = drawing.viewBox.baseVal;
    zones.forEach((zone) => {
      const point = layout.find((point) => point.id === zone.dataset.venueZone);
      const count = counts.get(zone.dataset.venueZone!) ?? 0;
      const hidden = !point || count === 0;
      zone.toggleAttribute('data-hidden', hidden);
      zone.setAttribute('aria-hidden', String(hidden));
      zone.setAttribute('tabindex', hidden ? '-1' : '0');
      if (!point) return;
      let labelX = point.labelX;
      let labelY = point.labelY;
      if (narrow.matches) {
        labelX = Math.max(
          view.x + 8,
          Math.min(view.x + view.width - 168, point.x - 80),
        );
        labelY = point.y > view.y + 100 ? point.y - 84 : point.y + 35;
        labelY = Math.max(
          view.y + 8,
          Math.min(view.y + view.height - 48, labelY),
        );
      }
      zone
        .querySelector('[data-venue-label]')!
        .setAttribute('transform', `translate(${labelX} ${labelY})`);
      zone
        .querySelector('[data-venue-leader]')!
        .setAttribute(
          'd',
          `M${narrow.matches ? labelX + 80 : point.edgeX} ${narrow.matches ? labelY + (labelY < point.y ? 40 : 0) : labelY + 20}L${point.x} ${point.y}`,
        );
      zone
        .querySelector('[data-venue-point]')!
        .setAttribute('cx', String(point.x));
      zone
        .querySelectorAll('[data-venue-point], [data-venue-hit]')
        .forEach((marker) => {
          marker.setAttribute('cx', String(point.x));
          marker.setAttribute('cy', String(point.y));
        });
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
    zoom = 1;
    panX = panY = 0;
    resize();
    if (activeZone) {
      clear();
      onZoneChange(null);
      planId = id;
    }
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
        zone.parentNode?.appendChild(zone);
        status.hidden = false;
        status.textContent = `Zona: ${venueZones.find((entry) => entry.id === next)!.label}.`;
      }
      onZoneChange(next);
    };
    zone.addEventListener('click', (event) => {
      if (performance.now() < suppressClickUntil) return;
      event.stopPropagation();
      choose();
    });
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
      void turn(orientation + Number(button.dataset.venueRotate));
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
    dragged = false;
    suppressClickUntil = 0;
    if (!event.isPrimary || event.button !== 0) return;
    if (zoom === 1 && (event.target as Element).closest('[data-venue-zone]'))
      return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX,
      panY,
    };
    if (zoom > 1 && !(event.target as Element).closest('[data-venue-zone]'))
      drawing.setPointerCapture(event.pointerId);
  });
  drawing.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId || zoom === 1 || pinch)
      return;
    const bounds = drawing.getBoundingClientRect();
    const scale = Math.min(
      bounds.width / drawing.viewBox.baseVal.width,
      bounds.height / drawing.viewBox.baseVal.height,
    );
    panX = pointer.panX - (event.clientX - pointer.x) / scale;
    panY = pointer.panY - (event.clientY - pointer.y) / scale;
    resize();
    draw();
  });
  drawing.addEventListener('pointerup', (event) => {
    if (pointer?.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    pointer = null;
    dragged = Math.hypot(dx, dy) > 12;
    if (dragged) suppressClickUntil = performance.now() + 500;
    if (zoom === 1 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3)
      void turn(orientation + (dx > 0 ? 1 : -1));
  });
  const touchDistance = (touches: TouchList) =>
    Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY,
    );
  drawing.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      pointer = null;
      pinch = { distance: touchDistance(event.touches), zoom };
    },
    { passive: false },
  );
  drawing.addEventListener(
    'touchmove',
    (event) => {
      if (!pinch || event.touches.length !== 2) return;
      event.preventDefault();
      zoom = Math.max(
        1,
        Math.min(
          2.5,
          (pinch.zoom * touchDistance(event.touches)) / pinch.distance,
        ),
      );
      resize();
      draw();
    },
    { passive: false },
  );
  const endPinch = () => {
    if (!pinch) return;
    pinch = null;
    pointer = null;
    suppressClickUntil = performance.now() + 500;
  };
  drawing.addEventListener(
    'touchend',
    (event) => {
      if ((dragged || pinch) && event.cancelable) event.preventDefault();
      endPinch();
    },
    { passive: false },
  );
  drawing.addEventListener('touchcancel', endPinch);
  drawing.addEventListener('pointercancel', () => {
    pointer = null;
  });
  drawing.addEventListener('lostpointercapture', () => {
    pointer = null;
  });
  drawing.addEventListener('click', (event) => {
    if (
      performance.now() < suppressClickUntil ||
      (event.target as Element).closest('[data-venue-zone]')
    )
      return;
    if (activeZone) {
      clear();
      onZoneChange(null);
    }
  });
  zoomButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.venueZoom);
      zoom = direction ? Math.max(1, Math.min(2.5, zoom + direction * 0.5)) : 1;
      if (zoom === 1) panX = panY = 0;
      resize();
      draw();
    }),
  );
  drawing.addEventListener(
    'wheel',
    (event) => {
      if (!event.deltaY || event.shiftKey) return;
      event.preventDefault();
      const pixels =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? drawing.clientHeight
            : 1);
      const next = Math.max(1, Math.min(2.5, zoom * Math.exp(-pixels * 0.002)));
      if (next === zoom) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
        drawing.getScreenCTM()!.inverse(),
      );
      const ratio = next / zoom;
      panX = point.x - (point.x - (460 + panX)) / ratio - 460;
      panY =
        point.y -
        (point.y - (narrow.matches ? 350 : 357.5) - panY) / ratio -
        (narrow.matches ? 350 : 357.5);
      zoom = next;
      if (zoom === 1) panX = panY = 0;
      resize();
      draw();
    },
    { passive: false },
  );
  map.querySelector<HTMLElement>('[data-venue-zoom-controls]')!.hidden = false;
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stopTurn();
      draw();
    }
  });
  function resize() {
    const [x, y, width, height] = narrow.matches
      ? [170, 65, 580, 570]
      : [0, 45, 920, 625];
    const w = width / zoom;
    const h = height / zoom;
    panX = Math.max(-(width - w) / 2, Math.min((width - w) / 2, panX));
    panY = Math.max(-(height - h) / 2, Math.min((height - h) / 2, panY));
    drawing.setAttribute(
      'viewBox',
      `${x + (width - w) / 2 + panX} ${y + (height - h) / 2 + panY} ${w} ${h}`,
    );
    drawing.toggleAttribute('data-zoomed', zoom > 1);
    zoomValue.textContent = `${Math.round(zoom * 100)}%`;
    zoomButtons.forEach((button) => {
      button.disabled =
        (button.dataset.venueZoom === '-1' && zoom === 1) ||
        (button.dataset.venueZoom === '1' && zoom === 2.5);
    });
  }
  narrow.addEventListener('change', () => {
    resize();
    draw();
  });
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
        !planId.startsWith('aulario-') &&
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
