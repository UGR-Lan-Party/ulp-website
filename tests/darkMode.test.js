import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = readFileSync(
  new URL('../src/scripts/darkMode.js', import.meta.url),
  'utf8',
);

function classList(initial = []) {
  const classes = new Set(initial);
  return {
    contains: (name) => classes.has(name),
    toggle(name, force) {
      const active = force ?? !classes.has(name);
      if (active) classes.add(name);
      else classes.delete(name);
      return active;
    },
  };
}

function page({
  theme = null,
  systemDark = false,
  path = '/',
  sticky = false,
  missing = [],
  storageBlocked = false,
} = {}) {
  const root = classList();
  const darkLogo = { classList: classList() };
  const lightLogo = { classList: classList(['hidden']) };
  let stored = theme;
  let onReady;
  let onClick;
  const elements = {
    themeSwitcher: {
      addEventListener: (event, callback) => {
        onClick = callback;
      },
    },
    'img-modo-oscuro': darkLogo,
    'img-modo-claro': lightLogo,
  };
  runInNewContext(source, {
    document: {
      documentElement: { classList: root },
      body: { classList: classList(sticky ? ['sticky-active'] : []) },
      getElementById: (id) => (missing.includes(id) ? null : elements[id]),
      addEventListener: (event, callback) => {
        onReady = callback;
      },
    },
    window: {
      location: { pathname: path },
      matchMedia: (query) => {
        assert.equal(query, '(prefers-color-scheme: dark)');
        return { matches: systemDark };
      },
    },
    localStorage: {
      getItem(key) {
        assert.equal(key, 'theme');
        if (storageBlocked) throw new Error('Storage blocked');
        return stored;
      },
      setItem(key, value) {
        assert.equal(key, 'theme');
        if (storageBlocked) throw new Error('Storage blocked');
        stored = value;
      },
    },
  });
  onReady();
  return {
    isDark: () => root.contains('dark'),
    storedTheme: () => stored,
    darkLogoVisible: () => !darkLogo.classList.contains('hidden'),
    lightLogoVisible: () => !lightLogo.classList.contains('hidden'),
    click: () => onClick(),
  };
}

for (const theme of [null, 'invalid', 'dark', 'light']) {
  for (const systemDark of [false, true]) {
    test(`Preference: stored=${theme}, systemDark=${systemDark}`, () => {
      const result = page({ theme, systemDark });
      const expected = theme === 'dark' || (theme !== 'light' && systemDark);
      assert.equal(result.isDark(), expected);
      // Leer la preferencia del sistema no guarda una eleccion manual.
      assert.equal(result.storedTheme(), theme);
    });
  }
}

for (const [path, sticky] of [
  ['/', false],
  ['/', true],
  ['/actividades/ajedrez', false],
]) {
  test(`Toggle and logos: path=${path}, sticky=${sticky}`, () => {
    const result = page({ path, sticky });
    const homeLogo = path === '/' && !sticky;
    assert.equal(result.darkLogoVisible(), homeLogo);
    assert.equal(result.lightLogoVisible(), !homeLogo);
    result.click();
    assert.equal(result.isDark(), true);
    assert.equal(result.storedTheme(), 'dark');
    assert.equal(result.darkLogoVisible(), true);
    assert.equal(result.lightLogoVisible(), false);
    const reloaded = page({ theme: result.storedTheme(), path, sticky });
    assert.equal(reloaded.isDark(), true);
    result.click();
    assert.equal(result.isDark(), false);
    assert.equal(result.storedTheme(), 'light');
    assert.equal(result.darkLogoVisible(), homeLogo);
    assert.equal(result.lightLogoVisible(), !homeLogo);
    assert.equal(
      page({ theme: result.storedTheme(), systemDark: true }).isDark(),
      false,
    );
  });
}

test('Missing switch or logos do not prevent initialization', () => {
  for (const id of ['themeSwitcher', 'img-modo-oscuro', 'img-modo-claro']) {
    assert.equal(page({ missing: [id], systemDark: true }).isDark(), true);
  }
  assert.equal(
    page({ missing: ['img-modo-oscuro', 'img-modo-claro'] }).isDark(),
    false,
  );
});

test('Blocked storage falls back to system and still allows switching', () => {
  const result = page({ systemDark: true, storageBlocked: true });
  assert.equal(result.isDark(), true);
  result.click();
  assert.equal(result.isDark(), false);
  assert.equal(result.storedTheme(), null);
});
