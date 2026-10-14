document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.getElementById('themeSwitcher');
  const darkLogo = document.getElementById('img-modo-oscuro');
  const lightLogo = document.getElementById('img-modo-claro');
  const isHomePage = window.location.pathname === '/';
  let storedTheme;

  try {
    storedTheme = localStorage.getItem('theme');
  } catch {
    storedTheme = null;
  }

  const updateLogo = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const isSticky = document.body.classList.contains('sticky-active');
    themeSwitcher?.setAttribute('aria-pressed', String(isDarkMode));
    const shouldShowDarkLogo = (isHomePage && !isSticky) || isDarkMode;

    darkLogo?.classList.toggle('hidden', !shouldShowDarkLogo);
    lightLogo?.classList.toggle('hidden', shouldShowDarkLogo);
  };

  const initializeTheme = () => {
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const isDarkMode =
      storedTheme === 'dark' || (storedTheme !== 'light' && systemPrefersDark);

    document.documentElement.classList.toggle('dark', isDarkMode);
    updateLogo();
  };

  const toggleTheme = () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');

    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {}
    updateLogo();
  };

  themeSwitcher?.addEventListener('click', toggleTheme);
  initializeTheme();
});
