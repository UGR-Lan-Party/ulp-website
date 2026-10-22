import { matchFreePlay } from '../utils/free-play.js';
const root = document.querySelector<HTMLElement>('[data-free-play]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-play-filters]')!;
  const time = form.querySelector<HTMLSelectElement>('[name="time"]')!;
  const group = form.querySelector<HTMLSelectElement>('[name="group"]')!;
  const mood = form.querySelector<HTMLSelectElement>('[name="mood"]')!;
  const cards = [...root.querySelectorAll<HTMLElement>('[data-experience]')];
  const status = root.querySelector<HTMLElement>('[data-play-status]')!;
  const empty = root.querySelector<HTMLElement>('[data-play-empty]')!;
  const widgets = [
    ...form.querySelectorAll<HTMLElement>('[data-play-select]'),
  ].map((container) => {
    const select = container.querySelector<HTMLSelectElement>('select')!;
    const button = container.querySelector<HTMLButtonElement>(
      '[data-play-select-toggle]',
    )!;
    const value = button.querySelector<HTMLElement>(
      '[data-play-select-value]',
    )!;
    const menu = container.querySelector<HTMLElement>('[role="listbox"]')!;
    const options = [...menu.querySelectorAll<HTMLElement>('[role="option"]')];
    const label = select.getAttribute('aria-label')!;
    button.id = `${select.id}-toggle`;
    container.querySelector<HTMLLabelElement>('label')!.htmlFor = button.id;
    function sync() {
      const text = select.selectedOptions[0].textContent!;
      value.textContent = text;
      button.setAttribute('aria-label', `${label}: ${text}`);
      options.forEach((option) =>
        option.setAttribute(
          'aria-selected',
          String(option.dataset.playOption === select.value),
        ),
      );
    }
    function close(focus = false) {
      const wasOpen = !menu.hidden;
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (focus && wasOpen) button.focus();
    }
    function open(
      index = options.findIndex(
        (option) => option.dataset.playOption === select.value,
      ),
    ) {
      widgets.forEach((widget) => widget.close());
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      options[Math.max(0, index)].focus();
    }
    function choose(option: HTMLElement) {
      select.value = option.dataset.playOption!;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    }
    button.addEventListener('click', () =>
      menu.hidden ? open() : close(true),
    );
    button.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        open(event.key === 'End' ? options.length - 1 : undefined);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    });
    options.forEach((option) =>
      option.addEventListener('click', () => choose(option)),
    );
    menu.addEventListener('keydown', (event) => {
      const current = options.indexOf(document.activeElement as HTMLElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? options.length - 1
              : (current +
                  (event.key === 'ArrowDown' ? 1 : -1) +
                  options.length) %
                options.length;
        options[next].focus();
      } else if (['Enter', ' '].includes(event.key) && current >= 0) {
        event.preventDefault();
        choose(options[current]);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      } else if (event.key === 'Tab') close();
      else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const next = [
          ...options.slice(current + 1),
          ...options.slice(0, current + 1),
        ].find((option) =>
          option
            .textContent!.trim()
            .toLocaleLowerCase('es')
            .startsWith(event.key.toLocaleLowerCase('es')),
        );
        if (next) {
          event.preventDefault();
          next.focus();
        }
      }
    });
    container.addEventListener('focusout', (event) => {
      if (!container.contains(event.relatedTarget as Node | null)) close();
    });
    select.hidden = true;
    button.hidden = false;
    sync();
    return { container, close, sync };
  });
  document.addEventListener('pointerdown', (event) =>
    widgets.forEach((widget) => {
      if (!widget.container.contains(event.target as Node)) widget.close();
    }),
  );
  function update() {
    const matches = matchFreePlay({
      time: time.value,
      group: group.value,
      mood: mood.value,
    });
    const ids = new Set(matches.map((item) => item.id));
    cards.forEach((card) => (card.hidden = !ids.has(card.dataset.experience!)));
    status.textContent = `${matches.length} ${matches.length === 1 ? 'experiencia para ti' : 'experiencias para explorar'}`;
    empty.hidden = matches.length !== 0;
    widgets.forEach((widget) => widget.sync());
  }
  form.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('change', update);
  root
    .querySelectorAll<HTMLButtonElement>('[data-play-reset]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        form.reset();
        widgets.forEach((widget) => widget.close());
        update();
      }),
    );
  update();
}
