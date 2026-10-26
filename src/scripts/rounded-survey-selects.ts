document
  .querySelectorAll<HTMLSelectElement>('.survey-controls select')
  .forEach((select, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'survey-select';
    select.after(wrapper);
    wrapper.append(select);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'survey-select-button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('ul');
    menu.className = 'survey-select-menu';
    menu.id = `survey-options-${index}`;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', select.getAttribute('aria-label')!);
    menu.hidden = true;
    button.setAttribute('aria-controls', menu.id);
    const options = Array.from(select.options).map((option, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
      li.textContent = option.label;
      li.addEventListener('click', () => choose(i));
      menu.append(li);
      return li;
    });
    const sync = () => {
      button.textContent = `${select.selectedOptions[0].label} ⌄`;
      button.setAttribute(
        'aria-label',
        `${select.getAttribute('aria-label')}: ${select.selectedOptions[0].label}`,
      );
      options.forEach((li, i) =>
        li.setAttribute('aria-selected', String(i === select.selectedIndex)),
      );
    };
    const close = (focus = false) => {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      if (focus) button.focus();
    };
    function choose(i: number) {
      select.selectedIndex = i;
      sync();
      select.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    }
    function open() {
      document.dispatchEvent(
        new CustomEvent('survey-select-open', { detail: menu.id }),
      );
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      options[select.selectedIndex].focus();
    }
    button.addEventListener('click', () => (menu.hidden ? open() : close()));
    button.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        open();
      }
    });
    menu.addEventListener('keydown', (e) => {
      const current = options.indexOf(document.activeElement as HTMLLIElement);
      let next = current;
      if (e.key === 'ArrowDown') next = (current + 1) % options.length;
      else if (e.key === 'ArrowUp')
        next = (current - 1 + options.length) % options.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = options.length - 1;
      else if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
        return;
      } else if (e.key === 'Tab') {
        close();
        return;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        choose(current);
        return;
      } else return;
      e.preventDefault();
      options[next].focus();
    });
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target as Node)) close();
    });
    document.addEventListener('survey-select-open', (e) => {
      if ((e as CustomEvent).detail !== menu.id) close();
    });
    select.addEventListener('change', sync);
    wrapper.append(button, menu);
    select.hidden = true;
    sync();
  });
