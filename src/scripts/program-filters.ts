import { createVenueMap } from './venue-map';
import { getVenueZones } from '../data/venue-map';
import { matchesProgramFilters } from '../utils/program-filters.js';

document.querySelectorAll<HTMLElement>('[data-program]').forEach((root) => {
  const form = root.querySelector<HTMLFormElement>('[data-program-filters]')!;
  const name = form.elements.namedItem('activity') as HTMLInputElement;
  const location = form.elements.namedItem('location') as HTMLSelectElement;
  const day = form.elements.namedItem('day') as HTMLSelectElement;
  const time = form.elements.namedItem('time') as HTMLInputElement;
  const rows = [
    ...root.querySelectorAll<HTMLTableRowElement>('[data-program-row]'),
  ];
  const status = root.querySelector<HTMLElement>('[data-program-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-program-empty]')!;
  const table = root.querySelector<HTMLElement>('[data-program-table]')!;
  const entries = rows.map((row) => ({
    row,
    name: row.dataset.name ?? '',
    location: row.dataset.location ?? '',
    day: row.dataset.day ?? '',
    start: row.dataset.start ?? '',
    end: row.dataset.end ?? '',
  }));

  let activeZone: string | null = null;
  const venueMap = createVenueMap(root, (zone) => {
    activeZone = zone;
    update();
  });

  function update() {
    const filters = {
      name: name.value.slice(0, 120),
      location: location.value,
      day: day.value,
      time: time.value,
    };
    let count = 0;
    const mapIndices: number[] = [];
    entries.forEach((entry, index) => {
      const matchesFilters = matchesProgramFilters(entry, filters);
      // Selecting a map zone filters the table, not the other map destinations.
      if (matchesFilters) mapIndices.push(index);
      const visible =
        matchesFilters &&
        (!activeZone || getVenueZones(entry.location).includes(activeZone));
      entry.row.hidden = !visible;
      if (visible) {
        entry.row.dataset.stripe = String(count % 2);
        count++;
      }
    });
    venueMap.update(mapIndices);
    status.textContent = `${count} de ${rows.length} actividades`;
    empty.hidden = count > 0;
    table.hidden = count === 0;
  }
  form.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', () => {
    activeZone = null;
    venueMap.clear();
    update();
  });
  form.addEventListener('reset', () => {
    activeZone = null;
    venueMap.clear();
    requestAnimationFrame(update);
  });
  update();
});
