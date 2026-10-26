import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const source = readFileSync(
  new URL('../src/scripts/darkMode.js', import.meta.url),
  'utf8',
);

function createClassList(initial = []) {
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

function createPage({
  theme = null,
  systemDark = false,
  path = '/',
  sticky = false,
  missing = [],
  storageBlocked = false,
} = {}) {
  const root = createClassList();
  const darkLogo = { classList: createClassList() };
  const lightLogo = { classList: createClassList(['hidden']) };
  let stored = theme;
  let onReady;
  let onClick;
  let onSystemChange;
  const windowEvents = new Map();
  const addWindowListener = (name, listener) =>
    windowEvents.set(name, listener);
  const mediaQuery = {
    get matches() {
      return systemDark;
    },
    addEventListener(name, listener) {
      assert.equal(name, 'change');
      onSystemChange = listener;
    },
  };
  const matchMedia = (query) => {
    assert.equal(query, '(prefers-color-scheme: dark)');
    return mediaQuery;
  };
  const elements = {
    themeSwitcher: {
      setAttribute: () => {},
      addEventListener: (event, callback) => {
        assert.equal(event, 'click');
        onClick = callback;
      },
    },
    'img-modo-oscuro': darkLogo,
    'img-modo-claro': lightLogo,
  };
  runInNewContext(source, {
    matchMedia,
    addEventListener: addWindowListener,
    document: {
      documentElement: { classList: root },
      body: { classList: createClassList(sticky ? ['sticky-active'] : []) },
      getElementById: (id) => (missing.includes(id) ? null : elements[id]),
      addEventListener: (event, callback) => {
        assert.equal(event, 'DOMContentLoaded');
        onReady = callback;
      },
    },
    window: {
      location: { pathname: path },
      matchMedia,
      addEventListener: addWindowListener,
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
  onReady?.();
  return {
    isDark: () => root.contains('dark'),
    storedTheme: () => stored,
    darkLogoVisible: () => !darkLogo.classList.contains('hidden'),
    lightLogoVisible: () => !lightLogo.classList.contains('hidden'),
    click: () => onClick(),
    setSystemDark(value) {
      systemDark = value;
      onSystemChange?.({ matches: value });
    },
    changeStorage(value) {
      stored = value;
      windowEvents.get('storage')?.({ key: 'theme' });
    },
    restoreFromHistory(value = stored) {
      stored = value;
      windowEvents.get('pageshow')?.({ persisted: true });
    },
  };
}

for (const [theme, systemDark, expectedDark] of [
  [null, false, false],
  [null, true, true],
  ['invalid', false, false],
  ['invalid', true, true],
  ['dark', false, true],
  ['dark', true, true],
  ['light', false, false],
  ['light', true, false],
]) {
  test(`Preference: stored=${theme}, systemDark=${systemDark}`, () => {
    const result = createPage({ theme, systemDark });
    assert.equal(result.isDark(), expectedDark);
    assert.equal(result.storedTheme(), theme);
  });
}

for (const [path, sticky] of [
  ['/', false],
  ['/', true],
  ['/actividades/ajedrez', false],
]) {
  test(`Toggle and logos: path=${path}, sticky=${sticky}`, () => {
    const result = createPage({ path, sticky });
    const homeLogo = false;
    assert.equal(result.darkLogoVisible(), homeLogo);
    assert.equal(result.lightLogoVisible(), !homeLogo);
    result.click();
    assert.equal(result.isDark(), true);
    assert.equal(result.storedTheme(), 'dark');
    assert.equal(result.darkLogoVisible(), true);
    assert.equal(result.lightLogoVisible(), false);
    const reloaded = createPage({ theme: result.storedTheme(), path, sticky });
    assert.equal(reloaded.isDark(), true);
    result.click();
    assert.equal(result.isDark(), false);
    assert.equal(result.storedTheme(), 'light');
    assert.equal(result.darkLogoVisible(), homeLogo);
    assert.equal(result.lightLogoVisible(), !homeLogo);
    assert.equal(
      createPage({ theme: result.storedTheme(), systemDark: true }).isDark(),
      false,
    );
  });
}

test('Missing switch or logos do not prevent initialization', () => {
  for (const id of ['themeSwitcher', 'img-modo-oscuro', 'img-modo-claro']) {
    assert.equal(
      createPage({ missing: [id], systemDark: true }).isDark(),
      true,
    );
  }
  assert.equal(
    createPage({ missing: ['img-modo-oscuro', 'img-modo-claro'] }).isDark(),
    false,
  );
});

test('Blocked storage falls back to system and still allows switching', () => {
  const result = createPage({ systemDark: true, storageBlocked: true });
  assert.equal(result.isDark(), true);
  result.click();
  assert.equal(result.isDark(), false);
  assert.equal(result.storedTheme(), null);
});

test('Automatic theme follows system changes while explicit choices remain selected', () => {
  const page = createPage();
  page.setSystemDark(true);
  assert.equal(page.isDark(), true);
  page.setSystemDark(false);
  assert.equal(page.isDark(), false);
  page.click();
  page.setSystemDark(true);
  page.setSystemDark(false);
  assert.equal(page.isDark(), true);
  assert.equal(page.storedTheme(), 'dark');
});

test('Another page can update or clear the stored theme', () => {
  const page = createPage({ theme: 'light', systemDark: true });
  page.changeStorage('dark');
  assert.equal(page.isDark(), true);
  page.changeStorage(null);
  page.setSystemDark(false);
  assert.equal(page.isDark(), false);
  assert.equal(page.lightLogoVisible(), true);
});

test('History restoration refreshes persisted choices and retains a volatile choice', () => {
  const page = createPage({ theme: 'light' });
  page.restoreFromHistory('dark');
  assert.equal(page.isDark(), true);
  const blocked = createPage({ systemDark: true, storageBlocked: true });
  blocked.click();
  blocked.restoreFromHistory();
  blocked.setSystemDark(false);
  blocked.setSystemDark(true);
  assert.equal(blocked.isDark(), false);
});
