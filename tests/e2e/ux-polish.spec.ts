import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test.use({ launchOptions: { args: ['--enable-unsafe-swiftshader'] } });
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({
    reducedMotion: 'no-preference',
    colorScheme: 'light',
  });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('El footer conserva su diseño y el movimiento sigue solo al sistema', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ulp-motion', 'reduce'));
  await page.goto('/');
  await expect(page.locator('[data-site-preferences]')).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Movimiento de la web' })).toHaveCount(0);
  const carousel = page.locator('[data-experience-carousel]');
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel).toHaveAttribute('data-rotation', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(carousel).toHaveAttribute('data-rotation', 'paused');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(carousel).toHaveAttribute('data-rotation', 'running');
});

test('La preferencia del sistema alcanza al mapa y mantiene la carga inicial de los trofeos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const url of [
    '/info/mapa/?plano=principal-0',
    '/info/mapa/obs/?plano=principal-0&controles=1',
  ]) {
    await page.goto(url);
    if (url.includes('/obs/'))
      await page
        .getByRole('button', { name: 'Mostrar controles', exact: true })
        .click();
    const orientation = await page
      .locator('[data-venue-map]')
      .getAttribute('data-orientation');
    await page
      .getByRole('button', { name: 'Rotar plano', exact: true })
      .click();
    await expect(page.locator('[data-venue-map]')).not.toHaveAttribute(
      'data-orientation',
      orientation!,
    );
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'aria-busy',
      'false',
    );
  }
  await page.goto('/actividades/league-of-legends/');
  await expect(page.locator('[data-trophy-status]')).toContainText('Arrastra');
  await expect(page.locator('[data-trophy] canvas')).toHaveCount(1);
});

test('El buscador permite reintentar sin perder la consulta ni cerrar el diálogo', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/buscar.json', async (route) => {
    calls++;
    if (calls === 1) await route.fulfill({ status: 503, body: '' });
    else await route.continue();
  });
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const dialog = page.locator('[data-global-search]');
  await dialog.getByRole('searchbox').fill('Tetris');
  await expect(
    dialog.getByText('El buscador no está disponible', { exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Reintentar búsqueda', exact: true })
    .click();
  await expect(dialog.locator('[data-search-results] a').first()).toContainText(
    'Tetris',
  );
  await expect(dialog.getByRole('searchbox')).toHaveValue('Tetris');
  await expect(dialog.getByRole('searchbox')).toBeFocused();
  expect(calls).toBe(2);
});

test('Carga y búsqueda vacía ofrecen una recuperación con teclado', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/buscar.json', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const dialog = page.locator('[data-global-search]');
  await expect(dialog.locator('[data-search-results]')).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(dialog.locator('[data-search-state]')).toContainText(
    'Preparando la búsqueda',
  );
  await dialog.getByRole('searchbox').fill('inexistente-xyz-ulp');
  release();
  await expect(
    dialog.getByText('No encontramos coincidencias', { exact: true }),
  ).toBeVisible();
  const clear = dialog.getByRole('button', {
    name: 'Limpiar búsqueda',
    exact: true,
  });
  await clear.focus();
  await clear.press('Enter');
  await expect(dialog.getByRole('searchbox')).toHaveValue('');
  await expect(dialog.getByRole('searchbox')).toBeFocused();
  await expect(dialog.locator('[data-search-state]')).toBeHidden();
});

for (const width of [390, 1440])
  test(`El estado vacío de la agenda se recupera y no desborda a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info/horarios/');
    const input = page.getByLabel('Actividad', { exact: true });
    await input.fill('inexistente-xyz-ulp');
    const state = page.locator('[data-program-empty]');
    await expect(state).toBeVisible();
    await state.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`agenda-empty-${width}.png`),
    });
    await state
      .getByRole('button', { name: 'Limpiar filtros', exact: true })
      .click();
    await expect(state).toBeHidden();
    await expect(input).toBeFocused();
    expect(
      await page.locator('[data-program-row]:visible').count(),
    ).toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test('La foto fallida se puede reintentar manteniendo la imagen anterior', async ({
  page,
}) => {
  let ready = false;
  const image = await readFile('public/assets/about/sobre-nosotros.png');
  await page.route('**/ux-retry.png', (route) =>
    route.fulfill(
      ready
        ? { status: 200, contentType: 'image/png', body: image }
        : { status: 503, body: '' },
    ),
  );
  await page.route('http://127.0.0.1:4323/', async (route) => {
    const response = await route.fetch();
    const photos = JSON.stringify([
      '/assets/about/sobre-nosotros.png',
      '/ux-retry.png',
    ]).replaceAll('"', '&quot;');
    const body = (await response.text())
      .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
      .replace(
        /data-(photos|previews)="[^"]*"/g,
        (_, key) => `data-${key}="${photos}"`,
      );
    await route.fulfill({ response, body });
  });
  await page.goto('/');
  const gallery = page.locator('.memory-gallery [data-photo-carousel]');
  await gallery.locator('[data-carousel-zoom]').focus();
  await gallery.locator('[data-carousel-zoom]').press('ArrowRight');
  await expect(gallery.locator('[data-carousel-retry]')).toBeVisible();
  await expect(gallery.locator('[data-carousel-counter]')).toHaveText(
    'Foto 1 de 2',
  );
  ready = true;
  await gallery
    .getByRole('button', { name: 'Reintentar foto', exact: true })
    .click();
  await expect(gallery.locator('[data-carousel-counter]')).toHaveText(
    'Foto 2 de 2',
  );
  await expect(gallery.locator('[data-carousel-retry]')).toBeHidden();
});

test('El tema sigue al sistema hasta elegirlo y los estados conservan contraste en móvil', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Modo oscuro', exact: true }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Modo oscuro', exact: true }).click();
  await page.keyboard.press('Control+k');
  await page.getByRole('searchbox').fill('inexistente-xyz-ulp');
  const feedback = page.locator('[data-search-state] .feedback-state');
  await expect(feedback).toBeVisible();
  const colors = await feedback.evaluate((el) => ({
    text: getComputedStyle(el).color,
    background: getComputedStyle(el).backgroundColor,
  }));
  const luminance = (color: string) =>
    color
      .match(/\d+/g)!
      .slice(0, 3)
      .map(Number)
      .map((v) => {
        const n = v / 255;
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const a = luminance(colors.text),
    b = luminance(colors.background);
  expect(
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
  ).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({
    path: testInfo.outputPath('search-empty-dark-mobile.png'),
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('Las páginas siguen navegando con sus controles y los efectos agrupan lecturas por frame', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    (window as any).uxDiagnostics = { longTasks: 0, layoutShift: 0 };
    for (const type of ['longtask', 'layout-shift']) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
      new PerformanceObserver((list) =>
        list.getEntries().forEach((entry) => {
          if (type === 'longtask') (window as any).uxDiagnostics.longTasks++;
          else if (!(entry as any).hadRecentInput)
            (window as any).uxDiagnostics.layoutShift += (entry as any).value;
        }),
      ).observe({ type, buffered: true });
    }
  });
  await page.goto('/');
  const reads = await page.locator('#home').evaluate(async (el) => {
    let count = 0;
    const getBox = el.getBoundingClientRect;
    el.getBoundingClientRect = () => {
      count++;
      return getBox.call(el);
    };
    for (let i = 0; i < 100; i++)
      el.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 180 + i,
          clientY: 200,
          pointerType: 'mouse',
        }),
      );
    await new Promise(requestAnimationFrame);
    el.getBoundingClientRect = getBox;
    return count;
  });
  expect(reads).toBe(1);
  expect(
    await page
      .locator('#contenido-principal')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await page
    .getByRole('link', { name: 'Actividades', exact: true })
    .first()
    .click();
  await expect(page.locator('.catalog-title')).toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(page.locator('[data-global-search]')).toBeVisible();
  const diagnostics = await page.evaluate(() => ({
    ...(window as any).uxDiagnostics,
    navigation: performance
      .getEntriesByType('navigation')
      .map((n) => ({ duration: n.duration })),
    paints: performance
      .getEntriesByType('paint')
      .map((p) => ({ name: p.name, start: p.startTime })),
  }));
  await testInfo.attach('ux-diagnostics.json', {
    body: JSON.stringify(diagnostics, null, 2),
    contentType: 'application/json',
  });
});
