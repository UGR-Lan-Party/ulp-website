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

  function update() {
    const filters = {
      name: name.value.slice(0, 120),
      location: location.value,
      day: day.value,
      time: time.value,
    };
    let count = 0;
    entries.forEach((entry) => {
      const visible = matchesProgramFilters(entry, filters);
      entry.row.hidden = !visible;
      if (visible) count++;
    });
    status.textContent = `${count} de ${rows.length} franjas`;
    empty.hidden = count > 0;
    table.hidden = count === 0;
  }
  form.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('reset', () => requestAnimationFrame(update));
  update();
});
