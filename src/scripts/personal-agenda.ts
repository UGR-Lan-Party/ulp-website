import {
  agendaKey,
  parseAgenda,
  findAgendaConflicts,
  createAgendaCalendar,
} from '../utils/personal-agenda.js';

interface AgendaEntry {
  key: string;
  activityId: string;
  name: string;
  label: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  href: string | null;
  time: string;
}
const source = document.querySelector('[data-agenda-data]');
if (source) {
  const { year, entries } = JSON.parse(source.textContent!) as {
    year: number;
    entries: AgendaEntry[];
  };
  const allowed = new Set(entries.map((entry) => entry.key));
  const storageKey = agendaKey(year);
  let selected = new Set<string>();
  let persistent = true;
  function read() {
    try {
      selected = parseAgenda(localStorage.getItem(storageKey), allowed);
    } catch {
      persistent = false;
    }
  }
  read();
  const panel = document.querySelector<HTMLElement>('[data-personal-agenda]');
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-agenda-toggle]'),
  );
  const status = document.querySelector<HTMLElement>('[data-agenda-status]');
  const dayFormat = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const describe = (entry: AgendaEntry) =>
    `${dayFormat.format(new Date(entry.startsAt))} · ${entry.time}${entry.label && entry.label !== entry.name ? ` · ${entry.label}` : ''}`;
  function persist(message: string) {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...selected]));
    } catch {
      persistent = false;
    }
    render();
    if (status)
      status.textContent =
        message +
        (!persistent
          ? ' No se puede guardar en el dispositivo; la selección dura solo en esta pestaña.'
          : '');
  }
  function render() {
    for (const button of buttons) {
      const ids: string[] = JSON.parse(button.dataset.agendaToggle!);
      const saved = ids.length > 0 && ids.every((id) => selected.has(id));
      button.hidden = false;
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute(
        'aria-label',
        `${saved ? 'Guardada en' : 'Guardar en'} mi agenda: ${button.dataset.agendaName}${saved ? '. Pulsa para quitarla.' : ''}`,
      );
      button.querySelector('[data-agenda-label]')!.textContent = saved
        ? 'Guardada'
        : 'Guardar';
    }
    if (!panel) return;
    panel.hidden = false;
    const saved = entries.filter((entry) => selected.has(entry.key));
    panel.querySelector('[data-agenda-total]')!.textContent =
      `${saved.length} ${saved.length === 1 ? 'guardada' : 'guardadas'}`;
    panel.querySelector<HTMLElement>('[data-agenda-empty]')!.hidden =
      saved.length > 0;
    const notice = panel.querySelector<HTMLElement>('[data-agenda-storage]')!;
    notice.hidden = persistent;
    notice.textContent =
      'El navegador no permite guardar la selección. Puedes usarla y descargarla durante esta visita.';
    const list = panel.querySelector('[data-agenda-list]')!;
    list.replaceChildren(
      ...saved.map((entry, index) => {
        const item = document.createElement('li');
        const copy = document.createElement('div');
        const title = document.createElement(entry.href ? 'a' : 'strong');
        if (entry.href) (title as HTMLAnchorElement).href = entry.href;
        title.textContent = entry.name;
        const date = document.createElement('p');
        date.textContent = describe(entry);
        const location = document.createElement('p');
        location.textContent = entry.location;
        copy.append(title, date, location);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Quitar';
        remove.setAttribute(
          'aria-label',
          `Quitar de mi agenda: ${entry.name}, ${describe(entry)}`,
        );
        remove.addEventListener('click', () => {
          selected.delete(entry.key);
          persist(`${entry.name} eliminada de tu agenda.`);
          const remaining = panel!.querySelectorAll<HTMLButtonElement>(
            '[data-agenda-list] button',
          );
          (
            remaining[Math.min(index, remaining.length - 1)] ??
            panel!.querySelector<HTMLElement>('#personal-agenda-title')!
          ).focus();
        });
        item.append(copy, remove);
        return item;
      }),
    );
    const conflicts = findAgendaConflicts(saved) as [
      AgendaEntry,
      AgendaEntry,
    ][];
    panel.querySelector<HTMLElement>('[data-agenda-conflicts]')!.hidden =
      !conflicts.length;
    panel.querySelector('[data-agenda-conflict-list]')!.replaceChildren(
      ...conflicts.map(([first, second]) => {
        const item = document.createElement('li');
        item.textContent = `${first.name} (${describe(first)}) coincide con ${second.name} (${describe(second)}).`;
        return item;
      }),
    );
    panel
      .querySelectorAll<HTMLButtonElement>(
        '[data-agenda-export], [data-agenda-clear]',
      )
      .forEach((button) => (button.disabled = !saved.length));
  }
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      const ids = (JSON.parse(button.dataset.agendaToggle!) as string[]).filter(
        (id) => allowed.has(id),
      );
      const saved = ids.every((id) => selected.has(id));
      ids.forEach((id) => (saved ? selected.delete(id) : selected.add(id)));
      persist(
        saved
          ? 'Actividad eliminada de tu agenda.'
          : 'Actividad guardada. Recuerda que esto no es una inscripción.',
      );
    }),
  );
  panel?.querySelector('[data-agenda-clear]')?.addEventListener('click', () => {
    selected.clear();
    persist('Agenda vaciada.');
    panel.querySelector<HTMLElement>('#personal-agenda-title')!.focus();
  });
  panel
    ?.querySelector('[data-agenda-export]')
    ?.addEventListener('click', () => {
      const content = createAgendaCalendar(
        entries.filter((entry) => selected.has(entry.key)),
        year,
      );
      const url = URL.createObjectURL(
        new Blob([content], { type: 'text/calendar;charset=utf-8' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `mi-agenda-ulp-${year}.ics`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    read();
    render();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      read();
      render();
    }
  });
  render();
}
