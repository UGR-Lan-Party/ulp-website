import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.goto('/info/horarios/');
});

test('El plano ocupa el ancho y los filtros sincronizan las plantas con la tabla abierta', async ({
  page,
}) => {
  const search = page.getByLabel('Actividad', { exact: true });
  const rows = page.locator('[data-program-row]:visible');
  await expect(page.locator('[data-program-table-disclosure]')).toHaveAttribute(
    'open',
  );
  await expect(page.locator('.venue-results')).toHaveCount(0);
  const mapWidth = await page
    .locator('.venue-map-column')
    .evaluate((element) => element.getBoundingClientRect().width);
  const containerWidth = await page
    .locator('[data-venue-map]')
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(mapWidth).toBeGreaterThan(containerWidth * 0.95);
  await search.fill('LEAGUE OF LEGENDS');
  await expect(rows).toHaveCount(4);
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'prefabricadas-a',
  );
  await expect(page.locator('[data-venue-zone="a2"]')).toBeVisible();
  await page
    .locator('[data-venue-building-select]')
    .selectOption('prefabricadas-b');
  await expect(page.locator('[data-venue-zone="b1"]')).toBeVisible();
  await search.fill('HACKING');
  await expect(page.locator('[data-venue-map]')).not.toContainText(
    'pendiente de situar',
  );
  await expect(rows.first()).toHaveAttribute(
    'data-location',
    'Sala de Profesores Externos.',
  );
  await expect(page.locator('[data-venue-zone]:visible')).toHaveCount(0);
  await page.getByRole('button', { name: 'Restablecer', exact: true }).click();
  await page
    .locator('[data-venue-building-select]')
    .selectOption('prefabricadas-a');
  await page.locator('[data-venue-zone="a1"] [data-venue-label]').click();
  const count = await rows.count();
  expect(count).toBeGreaterThan(1);
  expect(count).toBeLessThan(46);
  for (const row of await rows.all())
    await expect(row).toHaveAttribute('data-location', /A1/);
  await page.getByRole('button', { name: 'Ver todas las zonas' }).click();
  await expect(rows).toHaveCount(46);
});

test('El plano ofrece cuatro orientaciones con transición limpia y admite teclado y móvil', async ({
  page,
}) => {
  const map = page.locator('[data-venue-map]');
  const drawing = page.locator('[data-venue-drawing]');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await drawing.scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Girar plano a la derecha' }).click();
  await expect(map).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-venue-orientation="2"]')).toBeDisabled();
  await expect(map).toHaveAttribute('aria-busy', 'false');
  await expect(map).toHaveAttribute('data-orientation', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const orientation of [2, 3, 0, 1]) {
    await page.locator(`[data-venue-orientation="${orientation}"]`).click();
    await expect(map).toHaveAttribute('data-orientation', String(orientation));
    await expect(
      page.locator(`[data-venue-orientation="${orientation}"]`),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-venue-building]')).toHaveCSS(
      'transform',
      /matrix/,
    );
  }
  await drawing.focus();
  await page.keyboard.press('Home');
  await expect(map).toHaveAttribute('data-orientation', '0');
  await page.keyboard.press('ArrowLeft');
  await expect(map).toHaveAttribute('data-orientation', '3');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(drawing).toHaveAttribute('viewBox', '170 65 580 570');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('Los edificios y plantas tienen planos distintos sobre el fondo de la web', async ({
  page,
}) => {
  const map = page.locator('[data-venue-map]');
  await expect(
    map.getByRole('heading', { name: 'Plano interactivo', exact: true }),
  ).toBeVisible();
  await expect(map).not.toContainText('Plano preliminar');
  await expect(map).not.toContainText('Vista original');
  await expect(map).not.toContainText('Arrastra para girar');
  for (const [building, floor] of [
    ['principal', 'principal-0'],
    ['principal', 'principal-baja'],
    ['inferiores', 'aulas-inferiores'],
    ['prefabricadas-a', 'prefabricadas-a'],
    ['prefabricadas-b', 'prefabricadas-b'],
  ]) {
    await page.locator('[data-venue-building-select]').selectOption(building);
    if (building === 'principal')
      await page.locator('[data-venue-floor-select]').selectOption(floor);
    await expect(map).toHaveAttribute('data-venue-plan', floor);
    await expect(page.locator('[data-venue-floor-plan]:visible')).toHaveCount(
      1,
    );
    await expect(
      page.locator(`[data-venue-floor-plan="${floor}"]`),
    ).toBeVisible();
    for (const zone of await page.locator('[data-venue-zone]:visible').all())
      await expect(zone).toHaveAttribute('data-zone-plan', floor);
  }
  await expect(page.locator('.venue-map-column')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(page.locator('[data-program-filters]')).toHaveCSS(
    'background-color',
    'rgb(0, 68, 101)',
  );
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('.venue-map-column')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
});

test('El programa oficial está plegado y recupera sus animaciones al abrirlo y reabrirlo', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const program = page.locator('[data-official-program]');
  const summary = program.locator(':scope > summary');
  await expect(program).not.toHaveAttribute('open');
  const compactHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  await summary.click();
  await expect(program).toHaveAttribute('open');
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeGreaterThan(compactHeight + 3000);
  const outer = page.locator('#timeline-outer');
  await outer.evaluate((element) =>
    scrollTo({
      top: element.getBoundingClientRect().top + scrollY + innerHeight * 0.3,
      behavior: 'instant',
    }),
  );
  await expect
    .poll(() =>
      page
        .locator('.activity-card')
        .first()
        .evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeGreaterThan(0.1);
  await summary.click();
  await expect(program).not.toHaveAttribute('open');
  await summary.press('Enter');
  await expect(program).toHaveAttribute('open');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.activity-card').first()).toHaveCSS(
    'position',
    'relative',
  );
  await expect(page.locator('.activity-card').first()).toHaveCSS(
    'opacity',
    '1',
  );
});
