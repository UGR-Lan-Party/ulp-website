import {
  normalizeSocialSnapshot,
  SOCIAL_REFRESH_MS,
} from '../utils/social-statistics.js';

const panel = document.querySelector<HTMLElement>('[data-social-stats]');
if (panel) {
  const button = panel.querySelector<HTMLButtonElement>(
    '[data-social-refresh]',
  )!;
  const status = panel.querySelector<HTMLElement>('[data-social-status]')!;
  const formatter = new Intl.NumberFormat('es-ES', { useGrouping: true });
  const date = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  let timer: number | undefined,
    busy = false,
    failures = 0;
  const scroll = panel.querySelector<HTMLElement>('.social-table-scroll')!;
  const compact = window.matchMedia('(max-width: 1100px)');
  const showCurrent = () => {
    if (compact.matches) scroll.scrollLeft = scroll.scrollWidth;
  };
  compact.addEventListener('change', showCurrent);
  showCurrent();
  button.hidden = false;
  function schedule() {
    window.clearTimeout(timer);
    if (!document.hidden)
      timer = window.setTimeout(
        refresh,
        Math.min(SOCIAL_REFRESH_MS * 2 ** failures, 300_000),
      );
  }
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true;
    button.disabled = true;
    try {
      const response = await fetch('/api/social-stats', {
        cache: 'no-store',
        signal: AbortSignal.timeout(12_000),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Unavailable');
      const records = normalizeSocialSnapshot(await response.json());
      let live = 0,
        known = 0,
        total = 0;
      for (const item of records) {
        const row = panel!.querySelector<HTMLElement>(
          `[data-social-network="${item.id}"]`,
        )!;
        row.dataset.state = item.state;
        row.querySelector<HTMLElement>('[data-social-current]')!.textContent =
          item.count === null
            ? '—'
            : `${item.approximate && item.id !== 'discord' ? '≈ ' : ''}${formatter.format(item.count)}`;
        row.querySelector<HTMLElement>('[data-social-info]')!.textContent =
          item.state === 'live'
            ? 'Actualizado'
            : item.state === 'stale'
              ? 'Último dato disponible'
              : item.state === 'unconfigured'
                ? 'Pendiente de conexión'
                : 'No disponible';
        const time = row.querySelector<HTMLTimeElement>('[data-social-time]')!;
        time.hidden = !item.updatedAt;
        if (item.updatedAt) {
          time.dateTime = item.updatedAt;
          time.textContent = date.format(new Date(item.updatedAt));
        }
        if (item.count !== null) {
          known++;
          total += item.count;
        }
        if (item.state === 'live') live++;
      }
      panel!.querySelector<HTMLElement>('[data-social-total]')!.textContent =
        known
          ? `${records.some((item) => item.count !== null && item.approximate && item.id !== 'discord') ? '≈ ' : ''}${formatter.format(total)}`
          : '—';
      panel!.querySelector<HTMLElement>(
        '[data-social-total-note]',
      )!.textContent =
        known === records.length
          ? 'Todos los canales'
          : known
            ? `Parcial · ${known} de ${records.length} redes`
            : 'Sin datos actuales';
      status.textContent =
        live === records.length
          ? 'Actualizado · revisión cada minuto'
          : live
            ? `${live} de ${records.length} redes actualizadas`
            : known
              ? 'Últimos datos disponibles · actualización pendiente'
              : 'Contadores actuales aún no disponibles';
      failures = 0;
    } catch {
      status.textContent = 'Sin conexión con los contadores · reintentando';
      panel!
        .querySelectorAll<HTMLElement>('[data-social-network]')
        .forEach((row) => {
          row.dataset.state = 'stale';
          const time =
            row.querySelector<HTMLTimeElement>('[data-social-time]')!;
          row.querySelector<HTMLElement>('[data-social-info]')!.textContent =
            time.hidden ? 'No disponible' : 'Último dato disponible';
        });
      failures++;
    } finally {
      busy = false;
      button.disabled = false;
      schedule();
    }
  }
  button.addEventListener('click', () => {
    window.clearTimeout(timer);
    void refresh();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearTimeout(timer);
    else void refresh();
  });
  window.addEventListener('online', () => void refresh());
  void refresh();
}
