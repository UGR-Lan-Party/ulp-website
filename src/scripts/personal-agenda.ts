import {
  createSharedAgendaUrl,
  decodeSharedAgenda,
} from '../utils/agenda-sharing.js';
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
        '[data-agenda-export], [data-agenda-clear], [data-agenda-share]',
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
  const shareDialog = document.querySelector<HTMLDialogElement>(
    '[data-agenda-share-dialog]',
  );
  if (shareDialog && panel) {
    const outgoing = shareDialog.querySelector<HTMLElement>(
      '[data-agenda-outgoing]',
    )!;
    const incoming = shareDialog.querySelector<HTMLElement>(
      '[data-agenda-incoming]',
    )!;
    const urlInput = shareDialog.querySelector<HTMLInputElement>(
      '[data-agenda-share-url]',
    )!;
    const shareStatus = shareDialog.querySelector<HTMLElement>(
      '[data-agenda-share-status]',
    )!;
    const qr =
      shareDialog.querySelector<HTMLCanvasElement>('[data-agenda-qr]')!;
    let focusBefore: HTMLElement | null = null;
    function openShare() {
      focusBefore = document.activeElement as HTMLElement;
      shareDialog!.showModal();
    }
    shareDialog
      .querySelector('[data-agenda-share-close]')!
      .addEventListener('click', () => shareDialog.close());
    shareDialog.addEventListener('close', () => focusBefore?.focus());
    shareDialog.addEventListener('click', (event) => {
      if (event.target === shareDialog) {
        const rect = shareDialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          shareDialog.close();
      }
    });
    panel
      .querySelector('[data-agenda-share]')!
      .addEventListener('click', async () => {
        const url = createSharedAgendaUrl(
          selected,
          entries,
          year,
          location.origin,
        );
        if (!url) return;
        outgoing.hidden = false;
        incoming.hidden = true;
        urlInput.value = url;
        shareStatus.textContent = '';
        qr.hidden = true;
        openShare();
        try {
          const { default: QRCode } = await import('qrcode');
          await QRCode.toCanvas(qr, url, {
            width: 260,
            margin: 4,
            color: { dark: '#004465', light: '#ffffff' },
            errorCorrectionLevel: 'M',
          });
          qr.hidden = false;
        } catch {
          shareStatus.textContent =
            'El QR no está disponible. Puedes copiar el enlace.';
        }
      });
    shareDialog
      .querySelector('[data-agenda-copy]')!
      .addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(urlInput.value);
          shareStatus.textContent = 'Enlace copiado. ¡Pásalo al grupo!';
        } catch {
          urlInput.focus();
          urlInput.select();
          shareStatus.textContent =
            'Mantén pulsado el enlace o usa Ctrl+C para copiarlo.';
        }
      });
    const nativeButton = shareDialog.querySelector<HTMLButtonElement>(
      '[data-agenda-native]',
    )!;
    nativeButton.hidden = typeof navigator.share !== 'function';
    nativeButton.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: `Mi agenda · ULP ${year}`,
          url: urlInput.value,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError'))
          shareStatus.textContent =
            'No se ha podido compartir. Puedes copiar el enlace.';
      }
    });
    const receiveSharedAgenda = () => {
      if (!location.hash.startsWith('#agenda=')) return;
      const shared = decodeSharedAgenda(
        location.hash.slice(8),
        entries,
        year,
      ) as Set<string> | null;
      if (shared?.size) {
        panel.querySelector<HTMLElement>('[data-agenda-link-error]')!.hidden =
          true;
        incoming.hidden = false;
        outgoing.hidden = true;
        const accepted = new Set<string>();
        const saveSelection = shareDialog.querySelector<HTMLButtonElement>(
          '[data-agenda-import-selected]',
        )!;
        const updateSelection = () => {
          saveSelection.disabled = accepted.size === 0;
          saveSelection.textContent = `Guardar selección (${accepted.size})`;
          shareStatus.textContent = `${accepted.size} de ${shared.size} actividades aceptadas. No se guardan hasta confirmar.`;
        };
        shareDialog
          .querySelector('[data-agenda-incoming-list]')!
          .replaceChildren(
            ...entries
              .filter((entry) => shared.has(entry.key))
              .map((entry) => {
                const li = document.createElement('li');
                li.className = 'incoming-activity';
                li.dataset.agendaIncomingKey = entry.key;
                li.dataset.decision = 'pending';
                const copy = document.createElement('div');
                const name = document.createElement('strong');
                name.textContent = entry.name;
                const time = document.createElement('span');
                time.className = 'incoming-time';
                time.textContent = describe(entry);
                copy.append(name, time);
                if (selected.has(entry.key)) {
                  const existing = document.createElement('span');
                  existing.className = 'incoming-hint';
                  existing.textContent =
                    'Ya está en tu agenda; rechazarla aquí no la elimina.';
                  copy.append(existing);
                }
                const choices = document.createElement('div');
                choices.className = 'incoming-decisions';
                choices.setAttribute('role', 'group');
                choices.setAttribute(
                  'aria-label',
                  `Decisión para ${entry.name}, ${describe(entry)}`,
                );
                const accept = document.createElement('button');
                const reject = document.createElement('button');
                accept.type = reject.type = 'button';
                accept.textContent = 'Aceptar';
                reject.textContent = 'Rechazar';
                accept.setAttribute('aria-pressed', 'false');
                reject.setAttribute('aria-pressed', 'false');
                const decide = (include: boolean) => {
                  if (include) accepted.add(entry.key);
                  else accepted.delete(entry.key);
                  li.dataset.decision = include ? 'accepted' : 'rejected';
                  accept.setAttribute('aria-pressed', String(include));
                  reject.setAttribute('aria-pressed', String(!include));
                  updateSelection();
                };
                accept.addEventListener('click', () => decide(true));
                reject.addEventListener('click', () => decide(false));
                choices.append(accept, reject);
                li.append(copy, choices);
                return li;
              }),
          );
        updateSelection();
        if (!shareDialog.open) openShare();
        const importSelection = (keys: Set<string>) => {
          keys.forEach((key) => selected.add(key));
          persist('Actividades compartidas añadidas a tu agenda.');
          shareDialog.close();
          history.replaceState(
            null,
            '',
            location.pathname + location.search + '#mi-agenda',
          );
          panel.scrollIntoView({ block: 'start' });
        };
        saveSelection.onclick = () => {
          if (accepted.size) importSelection(accepted);
        };
        shareDialog.querySelector<HTMLButtonElement>(
          '[data-agenda-import]',
        )!.onclick = () => importSelection(shared);
      } else {
        const errorMessage =
          'El enlace de agenda no es válido o pertenece a otra versión del programa. Tu agenda no ha cambiado.';
        const notice = panel.querySelector<HTMLElement>(
          '[data-agenda-link-error]',
        )!;
        notice.hidden = false;
        notice.textContent = errorMessage;
        if (status) status.textContent = errorMessage;
      }
    };
    receiveSharedAgenda();
    window.addEventListener('hashchange', receiveSharedAgenda);
  }
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
