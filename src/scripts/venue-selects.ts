export {};
const venueNativeSelects = Array.from(
  document.querySelectorAll<HTMLSelectElement>(
    '[data-route-origin], [data-route-destination], [data-venue-building-select], [data-venue-floor-select]',
  ),
);
const venueSelectControllers: { sync: () => void; close: () => void }[] = [];
venueNativeSelects.forEach((select, index) => {
  if (select.hasAttribute('data-ulp-enhanced')) return;
  const label =
    select.getAttribute('aria-label') ||
    Array.from(select.labels?.[0]?.childNodes ?? [])
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('')
      .trim() ||
    'Seleccionar';
  const wrapper = document.createElement('span');
  wrapper.className = 'ulp-select';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ulp-select-button';
  button.id = `venue-select-${index}`;
  button.dataset.venueSelect = select.hasAttribute('data-route-origin')
    ? 'origin'
    : select.hasAttribute('data-route-destination')
      ? 'destination'
      : select.hasAttribute('data-venue-building-select')
        ? 'building'
        : 'floor';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  const text = document.createElement('span'),
    chevron = document.createElement('span');
  chevron.textContent = '⌄';
  chevron.setAttribute('aria-hidden', 'true');
  button.append(text, chevron);
  const menu = document.createElement('div');
  menu.className = 'ulp-select-menu';
  menu.id = `venue-select-options-${index}`;
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', label);
  menu.hidden = true;
  button.setAttribute('aria-controls', menu.id);
  select.before(wrapper);
  wrapper.append(select, button);
  document.body.append(menu);
  select.dataset.ulpEnhanced = '';
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  let optionButtons: HTMLButtonElement[] = [],
    structure = '',
    search = '',
    searchTimer: ReturnType<typeof setTimeout>;
  const place = () => {
    if (menu.hidden) return;
    const rect = button.getBoundingClientRect(),
      viewport = innerHeight;
    if (rect.bottom < 0 || rect.top > viewport) {
      close();
      return;
    }
    const width = Math.min(rect.width, innerWidth - 16),
      below = viewport - rect.bottom - 14,
      above = rect.top - 14;
    const useAbove = below < 220 && above > below;
    menu.style.width = `${width}px`;
    menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - width - 8))}px`;
    menu.style.maxHeight = `${Math.min(336, Math.max(56, useAbove ? above : below))}px`;
    menu.style.top = `${useAbove ? Math.max(8, rect.top - menu.getBoundingClientRect().height - 6) : rect.bottom + 6}px`;
  };
  const close = (focus = false) => {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (focus) button.focus();
  };
  const choose = (i: number) => {
    if (select.options[i]?.disabled || select.disabled) return;
    select.selectedIndex = i;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
    close(true);
  };
  const appendOption = (option: HTMLOptionElement, disabledGroup = false) => {
    const i = Array.from(select.options).indexOf(option),
      item = document.createElement('button');
    item.type = 'button';
    item.className = 'ulp-select-option';
    item.tabIndex = -1;
    item.setAttribute('role', 'option');
    item.dataset.value = option.value;
    item.textContent = option.label;
    item.disabled = option.disabled || disabledGroup;
    item.addEventListener('click', () => choose(i));
    menu.append(item);
    optionButtons[i] = item;
  };
  function sync() {
    const signature = Array.from(select.children)
      .map((child) => child.outerHTML)
      .join('');
    if (signature !== structure) {
      structure = signature;
      menu.replaceChildren();
      optionButtons = [];
      for (const child of Array.from(select.children)) {
        if (child instanceof HTMLOptGroupElement) {
          const group = document.createElement('div');
          group.className = 'ulp-select-group';
          group.textContent = child.label;
          group.setAttribute('aria-hidden', 'true');
          menu.append(group);
          for (const option of Array.from(child.children))
            if (option instanceof HTMLOptionElement)
              appendOption(option, child.disabled);
        } else if (child instanceof HTMLOptionElement) appendOption(child);
      }
    }
    text.textContent = select.selectedOptions[0]?.label || 'Seleccionar';
    button.disabled = select.disabled || !select.options.length;
    button.setAttribute('aria-label', `${label}: ${text.textContent}`);
    optionButtons.forEach((item, i) =>
      item.setAttribute('aria-selected', String(i === select.selectedIndex)),
    );
    if (button.disabled) close();
    else place();
  }
  function open() {
    if (button.disabled) return;
    venueSelectControllers.forEach((controller) => controller.close());
    sync();
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    place();
    const selected =
      optionButtons[select.selectedIndex] ??
      optionButtons.find((item) => !item.disabled);
    selected?.focus({ preventScroll: true });
    selected?.scrollIntoView({ block: 'nearest' });
  }
  button.addEventListener('click', () => (menu.hidden ? open() : close(true)));
  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
    }
  });
  menu.addEventListener('keydown', (event) => {
    const items = optionButtons.filter((item) => !item.disabled),
      current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === 'ArrowDown') next = (current + 1) % items.length;
    else if (event.key === 'ArrowUp')
      next = (current - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
      return;
    } else if (event.key === 'Tab') {
      close(true);
      return;
    } else if (event.key.length === 1 && event.key !== ' ') {
      search += event.key.toLocaleLowerCase('es');
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => (search = ''), 700);
      next = items.findIndex((item) =>
        item.textContent?.toLocaleLowerCase('es').startsWith(search),
      );
    } else return;
    event.preventDefault();
    if (next >= 0) {
      items[next]?.focus({ preventScroll: true });
      items[next]?.scrollIntoView({ block: 'nearest' });
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (
      !wrapper.contains(event.target as Node) &&
      !menu.contains(event.target as Node)
    )
      close();
  });
  const observer = new MutationObserver(() =>
    queueMicrotask(() =>
      venueSelectControllers.forEach((controller) => controller.sync()),
    ),
  );
  observer.observe(select, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'selected', 'label'],
  });
  select.addEventListener('change', sync);
  window.addEventListener('resize', place);
  document.addEventListener('scroll', place, true);
  venueSelectControllers.push({ sync, close });
  sync();
});
document.addEventListener('click', () =>
  queueMicrotask(() =>
    venueSelectControllers.forEach((controller) => controller.sync()),
  ),
);
