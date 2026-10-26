const menuButton = document.getElementById('navbarToggler');
const navigation = document.getElementById('navbarCollapse');
const desktop = window.matchMedia('(min-width: 1024px)');
const menuBackdrop = document.querySelector('[data-mobile-menu-backdrop]');
const disclosures = [...document.querySelectorAll('[data-submenu-toggle]')];

function setDisclosure(button, open) {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  button.setAttribute('aria-expanded', String(open));
  if (panel) panel.hidden = !open;
}

function closeSubmenus() {
  disclosures.forEach((button) => setDisclosure(button, false));
}

function setMenu(open) {
  const mobileOpen = open && !desktop.matches;
  document.documentElement.classList.toggle('mobile-menu-open', mobileOpen);
  if (menuBackdrop) menuBackdrop.hidden = !mobileOpen;
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.classList.toggle('navbarTogglerActive', open);
  navigation?.classList.toggle('hidden', !open);
  if (!open) closeSubmenus();
}

menuBackdrop?.addEventListener('click', () => {
  setMenu(false);
  menuButton?.focus();
});

menuButton?.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

disclosures.forEach((button) => {
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    closeSubmenus();
    setDisclosure(button, open);
  });
});

navigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const openSubmenu = disclosures.find(
    (button) => button.getAttribute('aria-expanded') === 'true',
  );
  if (openSubmenu) {
    setDisclosure(openSubmenu, false);
    openSubmenu.focus();
  } else if (
    !desktop.matches &&
    menuButton?.getAttribute('aria-expanded') === 'true'
  ) {
    setMenu(false);
    menuButton.focus();
  }
});

document.addEventListener('click', (event) => {
  if (
    !navigation?.contains(event.target) &&
    !menuButton?.contains(event.target)
  )
    setMenu(false);
});

document.addEventListener('focusin', (event) => {
  if (!navigation?.contains(event.target) && event.target !== menuButton)
    setMenu(false);
});

desktop.addEventListener('change', () => setMenu(false));
