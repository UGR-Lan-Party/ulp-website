import { getCampusPerimeterViewport } from '../data/venue-campus-landscape';
import { createVenueRoutes } from './venue-routes';
import { venueCapacities } from '../data/venue-capacities';
import { getVenueLeaderPath } from '../data/venue-leaders';
import {
  venuePlans,
  selectableVenuePlans,
  venueZones,
  venueLayouts,
  getVenueZones,
  getVenueInitialOrientation,
  initialVenuePlan,
  isVenueInformation,
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
  const unlock = map.querySelector<HTMLButtonElement>('[data-venue-unlock]')!;
  const revealedPlans = new Set<VenuePlanId>();
  const isLocked = () =>
    (planId.startsWith('prefabricadas-') && !revealedPlans.has(planId)) ||
    (planId === 'recinto' &&
      campusVersion === 'modern' &&
      !modernCampusRevealed);
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
  const requestedPlan = new URLSearchParams(location.search).get('plano');
  const linkedPlan = venuePlans.find((plan) => plan.id === requestedPlan);
  let planId: VenuePlanId = linkedPlan?.id ?? initialVenuePlan;
  let orientation: VenueOrientation = getVenueInitialOrientation(planId);
  let activeZone: string | null = null;
  let activeInformation: string | null = null;
  let counts = new Map<string, number>();
  let turnVersion = 0;
  let turning = false;
  let navigating = false;
  let navigationVersion = 0;

  const roomHeading = map.querySelector<HTMLElement>(
    '[data-venue-room-heading]',
  )!;
  let campusVersion = 'legacy';
  let modernCampusRevealed = false;
  const campusSwitch = map.querySelector<HTMLFieldSetElement>(
    '[data-campus-switch]',
  )!;
  const campusNote = map.querySelector<HTMLElement>(
    '[data-campus-project-note]',
  )!;
  function setCampusVersion(value: string) {
    campusVersion = value === 'legacy' ? 'legacy' : 'modern';
    if (campusVersion === 'modern') routes?.clear();
    map!.dataset.campusVersion = campusVersion;
    campusSwitch
      .querySelectorAll<HTMLInputElement>('input')
      .forEach((input) => (input.checked = input.value === campusVersion));
    draw();
  }
  campusSwitch.addEventListener('change', (event) =>
    setCampusVersion((event.target as HTMLInputElement).value),
  );
  map
    .querySelector('[data-route-form]')!
    .addEventListener('submit', () => setCampusVersion('legacy'), {
      capture: true,
    });
  const zoomLimit = () =>
    planId === 'recinto' || planId === 'principal-estudiantes' ? 6 : 2.5;

  function syncControls() {
    const plan = venuePlans.find((plan) => plan.id === planId)!;
    buildingSelect.disabled = false;
    buildingSelect.value = plan.building;
    const overviewOption = Array.from(buildingSelect.options).find(
      (option) => option.value === 'recinto',
    );
    if (overviewOption)
      overviewOption.textContent =
        campusVersion === 'legacy' ? 'Vista General (Legacy)' : 'Vista General';
    const parent =
      'parent' in plan
        ? selectableVenuePlans.find((item) => item.id === plan.parent)!
        : plan;
    const floors = selectableVenuePlans.filter(
      (item) => item.building === parent.building,
    );
    roomHeading.hidden = !('parent' in plan);
    roomHeading.querySelector('[data-venue-room-title]')!.textContent =
      plan.floor;
    roomHeading.querySelector('[data-venue-room-parent]')!.textContent =
      parent.id === 'recinto'
        ? 'Volver a Vista General'
        : `Volver a la ${parent.floor.toLowerCase()}`;
    if (floorSelect.options[0]?.value !== floors[0].id) {
      floorSelect.replaceChildren(
        ...floors.map((floor) => new Option(floor.floor, floor.id)),
      );
    }
    floorSelect.value = parent.id;
    floorSelect.disabled = floors.length === 1;
    rotationButtons.forEach(
      (button) => (button.disabled = turning || navigating || isLocked()),
    );
    map!.dataset.venuePlan = planId;
    map!.dataset.orientation = String(orientation);
    viewStatus.textContent = `${plan.buildingLabel}, ${plan.floor}, orientación ${orientation + 1}`;
  }

  let routes: ReturnType<typeof createVenueRoutes> | undefined;
  function draw() {
    const locked = isLocked();
    campusSwitch.hidden = planId !== 'recinto';
    campusNote.hidden = planId !== 'recinto' || campusVersion === 'legacy';
    map!.dataset.venueLocked = String(locked);
    unlock.hidden = !locked;
    unlock.querySelector('.construction-hint')!.textContent =
      planId === 'recinto'
        ? 'Pulsa para ver el proyecto de ampliación'
        : 'Pulsa para ver las aulas de 2026';
    drawing.setAttribute('tabindex', locked ? '-1' : '0');
    drawing.setAttribute('aria-hidden', String(locked));
    floorNotes.forEach(
      (note) => (note.hidden = note.dataset.venueFloorNote !== planId),
    );
    map!.style.setProperty('--venue-label-turn', `${-orientation * 90}deg`);
    plans.forEach((plan) =>
      plan.toggleAttribute(
        'data-hidden',
        plan.dataset.venueFloorPlan !== planId ||
          (!!plan.dataset.campusVersion &&
            plan.dataset.campusVersion !== campusVersion),
      ),
    );
    building.style.transform = `rotate(${orientation * 90}deg)`;
    if (planId === 'recinto') resize();
    const layout = venueLayouts[planId][orientation];
    const view = drawing.viewBox.baseVal;
    zones.forEach((zone) => {
      const point = layout.find((point) => point.id === zone.dataset.venueZone);
      const count = counts.get(zone.dataset.venueZone!) ?? 0;
      const hidden =
        !point ||
        (!!zone.dataset.campusOnly &&
          zone.dataset.campusOnly !== campusVersion) ||
        (count === 0 && !isVenueInformation(zone.dataset.venueZone!));
      zone.toggleAttribute('data-hidden', hidden);
      zone.setAttribute('aria-hidden', String(hidden));
      zone.setAttribute('tabindex', hidden || locked ? '-1' : '0');
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
      if (narrow.matches && planId === 'aulario-0' && point.side === 'bottom')
        labelY = Math.max(
          point.y + 35,
          Math.min(view.y + view.height - 48, point.labelY),
        );
      if (narrow.matches && planId === 'aulas-inferiores') {
        if (orientation % 2 === 0) labelY = orientation === 0 ? 544 : 560;
        else {
          labelX = orientation === 1 ? view.x + 8 : view.x + view.width - 168;
          labelY = point.y - 20;
        }
      }
      zone
        .querySelector('[data-venue-label]')!
        .setAttribute('transform', `translate(${labelX} ${labelY})`);
      zone.querySelector('[data-venue-leader]')!.setAttribute(
        'd',
        getVenueLeaderPath(
          {
            x: narrow.matches ? labelX + 80 : point.edgeX,
            y: narrow.matches
              ? labelY + (labelY < point.y ? 40 : 0)
              : point.edgeY,
          },
          point,
          narrow.matches,
          point.via,
        ),
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
    const capacityCard = map!.querySelector<HTMLElement>(
      '[data-venue-room-capacity]',
    )!;
    const capacity =
      planId === 'principal-actos'
        ? venueCapacities.actos
        : planId === 'principal-grados'
          ? venueCapacities.grados
          : null;
    capacityCard.hidden = !capacity;
    capacityCard.querySelector(
      '[data-venue-room-capacity-value]',
    )!.textContent = capacity ? String(capacity) : '';
    syncControls();
    routes?.refresh();
  }

  function stopTurn() {
    turnVersion++;
    navigationVersion++;
    navigating = false;
    drawing.getAnimations().forEach((animation) => animation.cancel());
    building.getAnimations().forEach((animation) => animation.cancel());
    indicators.getAnimations().forEach((animation) => animation.cancel());
    indicators.style.opacity = '1';
    turning = false;
    map!.setAttribute('aria-busy', 'false');
  }

  function setPlan(id: VenuePlanId) {
    stopTurn();
    planId = id;
    orientation = getVenueInitialOrientation(id);
    zoom = 1;
    panX = panY = 0;
    resize();
    if (activeZone || activeInformation) {
      clear();
      onZoneChange(null);
      planId = id;
    }
    draw();
  }

  async function openPlan(id: VenuePlanId, zone: SVGGElement) {
    if (navigating) return;
    if (reducedMotion.matches) {
      setPlan(id);
      drawing.focus({ preventScroll: true });
      return;
    }
    stopTurn();
    const version = navigationVersion;
    navigating = true;
    syncControls();
    map!.setAttribute('aria-busy', 'true');
    const marker = zone.querySelector<SVGCircleElement>('[data-venue-point]')!;
    const point = new DOMPoint(
      marker.cx.baseVal.value,
      marker.cy.baseVal.value,
    ).matrixTransform(marker.getScreenCTM()!);
    const bounds = drawing.getBoundingClientRect();
    drawing.style.transformOrigin = `${point.x - bounds.left}px ${point.y - bounds.top}px`;
    try {
      await drawing.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.8)', opacity: 0 },
        ],
        {
          duration: 320,
          easing: 'cubic-bezier(.4, 0, .2, 1)',
          fill: 'forwards',
        },
      ).finished;
      if (version !== navigationVersion) return;
      setPlan(id);
      drawing.style.transformOrigin = '50% 50%';
      drawing.animate(
        [
          { transform: 'scale(.94)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: 260, easing: 'cubic-bezier(.2, .7, .3, 1)' },
      );
      drawing.focus({ preventScroll: true });
    } catch {}
  }

  async function turn(next: number) {
    const target = ((next + 4) % 4) as VenueOrientation;
    if (turning || navigating || target === orientation) return;
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
    const rotation = building.animate(
      [
        {
          transform: `rotate(${previous * 90}deg)`,
          '--venue-label-turn': `${-previous * 90}deg`,
        },
        {
          transform: `rotate(${(previous + delta) * 90}deg)`,
          '--venue-label-turn': `${-(previous + delta) * 90}deg`,
        },
      ],
      {
        duration: 620,
        easing: 'cubic-bezier(.45, 0, .2, 1)',
        fill: 'forwards',
      },
    );
    try {
      await indicators.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 120,
        fill: 'forwards',
      }).finished;
      if (version !== turnVersion) return;
      await rotation.finished;
      if (version !== turnVersion) return;
      draw();
      rotation.cancel();
      indicators.getAnimations().forEach((animation) => animation.cancel());
      await indicators.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
      }).finished;
    } catch {
    } finally {
      rotation.cancel();
    }
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
    activeInformation = null;
    activeZone = null;
    clearButton.textContent = 'Ver todas las zonas';
    clearButton.hidden = true;
    status.hidden = true;
    selectZones([]);
  }

  zones.forEach((zone) => {
    const choose = () => {
      if (isLocked()) return;
      const id = zone.dataset.venueZone!;
      const destination = venuePlans.find(
        (plan) => plan.id === zone.dataset.venueOpenPlan,
      );
      if (destination) {
        void openPlan(destination.id, zone);
        return;
      }
      if (isVenueInformation(id)) {
        activeInformation = activeInformation === id ? null : id;
        selectZones(
          [activeZone, activeInformation].filter((id): id is string =>
            Boolean(id),
          ),
        );
        clearButton.hidden = !activeZone && !activeInformation;
        clearButton.textContent = activeZone
          ? 'Ver todas las zonas'
          : 'Cerrar información';
        status.hidden = !activeZone && !activeInformation;
        const selected = activeInformation ?? activeZone;
        if (selected)
          status.textContent = venueZones.find(
            (zone) => zone.id === selected,
          )!.label;
        if (activeInformation) zone.parentNode?.appendChild(zone);
        return;
      }
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
  map
    .querySelectorAll<SVGGElement>('[data-venue-go-floor]')
    .forEach((marker) => {
      const navigate = () => {
        const destination = venuePlans.find(
          (plan) => plan.id === marker.dataset.venueGoFloor,
        );
        const current = venuePlans.find((plan) => plan.id === planId);
        if (
          !destination ||
          !current ||
          destination.building !== current.building
        )
          return;
        setPlan(destination.id);
        map
          .querySelector<SVGGElement>(
            `[data-venue-floor-plan="${destination.id}"] [data-venue-amenity="${marker.dataset.venueAmenity}"][data-venue-go-floor]`,
          )
          ?.focus({ preventScroll: true });
      };
      marker.addEventListener('click', (event) => {
        event.stopPropagation();
        if (performance.now() < suppressClickUntil) return;
        navigate();
      });
      marker.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        navigate();
      });
    });
  clearButton.addEventListener('click', () => {
    clear();
    onZoneChange(null);
  });
  unlock.addEventListener('click', () => {
    if (planId === 'recinto' && campusVersion === 'modern')
      modernCampusRevealed = true;
    else revealedPlans.add(planId);
    draw();
    resize();
    drawing.focus({ preventScroll: true });
  });
  map.querySelector('[data-venue-room-back]')!.addEventListener('click', () => {
    const plan = venuePlans.find((plan) => plan.id === planId)!;
    if ('parent' in plan) {
      setPlan(plan.parent);
      drawing.focus({ preventScroll: true });
    }
  });
  buildingSelect.addEventListener('change', () => {
    const plan = selectableVenuePlans.find(
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
        ? getVenueInitialOrientation(planId)
        : orientation + (event.key === 'ArrowLeft' ? -1 : 1),
    );
  });
  drawing.addEventListener('pointerdown', (event) => {
    dragged = false;
    suppressClickUntil = 0;
    if (!event.isPrimary || event.button !== 0) return;
    if (
      (event.target as Element).closest(
        '[data-venue-external], [data-venue-go-floor]',
      )
    )
      return;
    if (event.pointerType === 'mouse' && zoom > 1) event.preventDefault();
    if (
      zoom === 1 &&
      (event.target as Element).closest(
        '[data-venue-zone], [data-venue-open-plan], [data-venue-external], [data-venue-go-floor]',
      )
    )
      return;
    drawing.toggleAttribute(
      'data-panning',
      zoom > 1 &&
        !(event.target as Element).closest(
          '[data-venue-zone], [data-venue-open-plan], [data-venue-external], [data-venue-go-floor]',
        ),
    );
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX,
      panY,
    };
    if (
      zoom > 1 &&
      !(event.target as Element).closest(
        '[data-venue-zone], [data-venue-open-plan], [data-venue-external], [data-venue-go-floor]',
      )
    )
      drawing.setPointerCapture(event.pointerId);
  });
  drawing.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId || zoom === 1 || pinch)
      return;
    if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) <= 4)
      return;
    drawing.setAttribute('data-panning', '');
    drawing.setPointerCapture(event.pointerId);
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
    drawing.removeAttribute('data-panning');
    dragged = Math.hypot(dx, dy) > (zoom > 1 ? 4 : 12);
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
          zoomLimit(),
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
    drawing.removeAttribute('data-panning');
    pointer = null;
  });
  drawing.addEventListener('lostpointercapture', () => {
    drawing.removeAttribute('data-panning');
    pointer = null;
  });
  drawing.addEventListener('click', (event) => {
    if (
      performance.now() < suppressClickUntil ||
      (event.target as Element).closest(
        '[data-venue-zone], [data-venue-open-plan], [data-venue-external], [data-venue-go-floor]',
      )
    )
      return;
    if (activeZone || activeInformation) {
      clear();
      onZoneChange(null);
    }
  });
  zoomButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.venueZoom);
      zoom = direction
        ? Math.max(1, Math.min(zoomLimit(), zoom + direction * 0.5))
        : 1;
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
      const next = Math.max(
        1,
        Math.min(zoomLimit(), zoom * Math.exp(-pixels * 0.002)),
      );
      if (next === zoom) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
        drawing.getScreenCTM()!.inverse(),
      );
      const ratio = next / zoom;
      panX = point.x - (point.x - (460 + panX)) / ratio - 460;
      const [, viewportY, , viewportHeight] = getViewport();
      const centerY = viewportY + viewportHeight / 2;
      panY = point.y - (point.y - centerY - panY) / ratio - centerY;
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
  function getViewport() {
    if (planId === 'recinto') return getCampusPerimeterViewport(orientation);
    return narrow.matches ? [170, 65, 580, 570] : [0, 45, 920, 625];
  }
  function resize() {
    const [x, y, width, height] = getViewport();
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
        isLocked() ||
        (button.dataset.venueZoom === '-1' && zoom === 1) ||
        (button.dataset.venueZoom === '1' && zoom === zoomLimit());
    });
  }
  narrow.addEventListener('change', () => {
    resize();
    draw();
  });
  routes = createVenueRoutes(
    map,
    (id) => {
      revealedPlans.add(id);
      setPlan(id);
    },
    () => planId,
  );
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
      const currentPlan = venuePlans.find((plan) => plan.id === planId)!;
      const locationPlanId =
        'parent' in currentPlan && currentPlan.parent !== 'recinto'
          ? currentPlan.parent
          : planId;
      if (
        planId !== 'recinto' &&
        !planId.startsWith('aulario-') &&
        !venueZones.some(
          (zone) => zone.plan === locationPlanId && counts.has(zone.id),
        )
      ) {
        const plan = venuePlans.find((plan) =>
          venueZones.some(
            (zone) => zone.plan === plan.id && counts.has(zone.id),
          ),
        );
        if (plan) {
          planId = plan.id;
          orientation = getVenueInitialOrientation(plan.id);
        }
      }
      stopTurn();
      draw();
    },
  };
}
