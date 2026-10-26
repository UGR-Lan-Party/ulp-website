import { searchSite, safeInternalHref } from '../utils/global-search.js';
interface SearchEntry {
  title: string;
  description: string;
  kind: string;
  href: string;
  keywords?: string;
}
const dialog = document.querySelector<HTMLDialogElement>(
  '[data-global-search]',
);
if (dialog) {
  const input = dialog.querySelector<HTMLInputElement>('[data-search-input]')!;
  const results = dialog.querySelector<HTMLElement>('[data-search-results]')!;
  const feedback = dialog.querySelector<HTMLElement>('[data-search-feedback]')!;
  let entries: SearchEntry[] | null = null;
  let pending: Promise<void> | null = null;
  let previous: HTMLElement | null = null;
  const state = dialog.querySelector<HTMLElement>('[data-search-state]')!;
  const stateTitle = state.querySelector<HTMLElement>('[data-feedback-title]')!;
  const stateMessage = state.querySelector<HTMLElement>(
    '[data-feedback-message]',
  )!;
  const retry = state.querySelector<HTMLButtonElement>('[data-search-retry]')!;
  const clear = state.querySelector<HTMLButtonElement>('[data-search-clear]')!;
  function showState(kind: 'ready' | 'loading' | 'empty' | 'error') {
    state.hidden = kind === 'ready';
    state.dataset.state = kind;
    results.hidden = kind !== 'ready';
    results.setAttribute('aria-busy', String(kind === 'loading'));
    retry.hidden = kind !== 'error';
    clear.hidden = kind !== 'empty';
    const messages = {
      ready: ['', ''],
      loading: [
        'Preparando la búsqueda',
        'Cargando actividades, aulas y páginas…',
      ],
      empty: [
        'No encontramos coincidencias',
        'Prueba con el nombre de un juego, un aula o una actividad.',
      ],
      error: [
        'El buscador no está disponible',
        'Puedes reintentarlo aquí. Tu búsqueda se conserva.',
      ],
    };
    [stateTitle.textContent, stateMessage.textContent] = messages[kind];
  }
  function render() {
    if (!entries) return;
    const matches = searchSite(entries, input.value) as SearchEntry[];
    results.replaceChildren(
      ...matches.map((entry) => {
        const li = document.createElement('li'),
          link = document.createElement('a'),
          title = document.createElement('strong'),
          kind = document.createElement('small'),
          description = document.createElement('p');
        link.href = safeInternalHref(entry.href)!;
        title.textContent = entry.title;
        kind.textContent = entry.kind;
        description.textContent = entry.description;
        link.append(title, kind, description);
        li.append(link);
        return li;
      }),
    );
    showState(matches.length ? 'ready' : 'empty');
    feedback.textContent = input.value.trim()
      ? `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'}`
      : 'Empieza por una actividad o busca un aula.';
  }
  async function loadIndex() {
    if (pending) return pending;
    const refocus = document.activeElement === retry;
    showState('loading');
    feedback.textContent = 'Preparando la búsqueda…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    pending = fetch('/buscar.json', {
      credentials: 'omit',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw Error('Index unavailable');
        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.length > 1000)
          throw Error('Invalid index');
        entries = data.filter(
          (entry): entry is SearchEntry =>
            Boolean(entry) &&
            typeof entry.title === 'string' &&
            entry.title.length <= 250 &&
            typeof entry.description === 'string' &&
            entry.description.length <= 2000 &&
            typeof entry.kind === 'string' &&
            entry.kind.length <= 40 &&
            Boolean(safeInternalHref(entry.href)),
        );
        render();
      })
      .catch(() => {
        showState('error');
        feedback.textContent = 'No se ha podido cargar el buscador.';
      })
      .finally(() => {
        clearTimeout(timeout);
        pending = null;
        if (refocus && dialog!.open) (entries ? input : retry).focus();
      });
    return pending;
  }
  async function open() {
    if (dialog!.open) return;
    previous = document.activeElement as HTMLElement;
    dialog!.showModal();
    input.focus();
    if (entries) render();
    else await loadIndex();
  }
  retry.addEventListener('click', () => void loadIndex());
  clear.addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });
  document
    .querySelectorAll<HTMLButtonElement>('[data-search-open]')
    .forEach((button) => {
      button.hidden = false;
      button.addEventListener('click', open);
    });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog!.open) dialog!.close();
      else void open();
    }
  });
  dialog
    .querySelector('[data-search-close]')!
    .addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener('close', () => previous?.focus());
  input.addEventListener('input', render);
  dialog.addEventListener('keydown', (event) => {
    const links = Array.from(results.querySelectorAll<HTMLAnchorElement>('a'));
    if (!links.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      const next =
        index < 0
          ? event.key === 'ArrowDown'
            ? 0
            : links.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) %
            links.length;
      links[next]?.focus();
    } else if (event.key === 'Enter' && document.activeElement === input) {
      event.preventDefault();
      links[0].click();
    }
  });
}
