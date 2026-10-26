const themeSwitcher = document.getElementById('themeSwitcher');
const darkLogo = document.getElementById('img-modo-oscuro');
const lightLogo = document.getElementById('img-modo-claro');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function readTheme(fallback = null) {
  try {
    const value = localStorage.getItem('theme');
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return fallback;
  }
}
let storedTheme = readTheme();
function updateTheme() {
  const isDark =
    storedTheme === 'dark' || (storedTheme !== 'light' && systemTheme.matches);
  document.documentElement.classList.toggle('dark', isDark);
  themeSwitcher?.setAttribute('aria-pressed', String(isDark));
  darkLogo?.classList.toggle('hidden', !isDark);
  lightLogo?.classList.toggle('hidden', isDark);
}
themeSwitcher?.addEventListener('click', () => {
  storedTheme = document.documentElement.classList.contains('dark')
    ? 'light'
    : 'dark';
  try {
    localStorage.setItem('theme', storedTheme);
  } catch {}
  updateTheme();
});
systemTheme.addEventListener('change', updateTheme);
addEventListener('storage', (event) => {
  if (event.key !== 'theme' && event.key !== null) return;
  storedTheme = readTheme();
  updateTheme();
});
addEventListener('pageshow', () => {
  storedTheme = readTheme(storedTheme);
  updateTheme();
});
updateTheme();
