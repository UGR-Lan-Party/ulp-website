/* ========  themeSwitcher Mejorado con Logo en Inicio ========= */
document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.getElementById('themeSwitcher');
  const darkLogo = document.getElementById('img-modo-oscuro');
  const lightLogo = document.getElementById('img-modo-claro');
  const userTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isHomePage = window.location.pathname === '/';

  const aplicarTema = () => {
    if (isHomePage) {
      darkLogo.classList.add('hidden');
      lightLogo.classList.remove('hidden');
    } else {
      if (document.documentElement.classList.contains('dark')) {
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
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    aplicarTema();
  };

  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', themeSwitch);
  }

  themeCheck();
});
