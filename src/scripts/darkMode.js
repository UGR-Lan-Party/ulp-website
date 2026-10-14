/* ======== themeSwitcher ======== */
document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.getElementById('themeSwitcher');
  const darkLogo = document.getElementById('img-modo-oscuro');
  const lightLogo = document.getElementById('img-modo-claro');
  const isHomePage = window.location.pathname === '/';
  let userTheme;

  // El navegador puede impedir el acceso al almacenamiento local.
  try {
    userTheme = localStorage.getItem('theme');
  } catch {
    userTheme = null;
  }

  const aplicarTema = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const isSticky = document.body.classList.contains('sticky-active');
    const showDarkLogo = (isHomePage && !isSticky) || isDarkMode;

    darkLogo?.classList.toggle('hidden', !showDarkLogo);
    lightLogo?.classList.toggle('hidden', showDarkLogo);
  };

  const themeCheck = () => {
    const systemTheme = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const isDarkMode =
      userTheme === 'dark' || (userTheme !== 'light' && systemTheme);

    document.documentElement.classList.toggle('dark', isDarkMode);
    aplicarTema();
  };

  const themeSwitch = () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');

    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // El cambio visual sigue funcionando aunque no pueda guardarse.
    }
    aplicarTema();
  };

  themeSwitcher?.addEventListener('click', themeSwitch);
  themeCheck();
});
