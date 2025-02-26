/* ========  themeSwitcher Mejorado ========= */
document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.getElementById('themeSwitcher');
  const darkLogo = document.getElementById('img-modo-oscuro');
  const lightLogo = document.getElementById('img-modo-claro');
  const userTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isHomePage = window.location.pathname === '/';

  const aplicarTema = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const isSticky = document.body.classList.contains('sticky-active');

    if (isHomePage && !isSticky) {
      darkLogo.classList.remove('hidden');
      lightLogo.classList.add('hidden');

    } else {
      if (isDarkMode) {
        darkLogo.classList.remove('hidden');
        lightLogo.classList.add('hidden');
      } else {
        darkLogo.classList.add('hidden');
        lightLogo.classList.remove('hidden');
      }
    }
  };

  const themeCheck = () => {
    if (userTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (userTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (systemTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    aplicarTema(); 
  };

  const themeSwitch = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
    aplicarTema();
  };

  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', themeSwitch);
  }

  themeCheck();
});
