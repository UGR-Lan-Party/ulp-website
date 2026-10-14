import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('Los filtros del programa se combinan y se pueden restablecer', async ({
  page,
}) => {
  await page.goto('/info/horarios/');
  const program = page.locator('[data-program]');
  const form = program.getByRole('search');
  const rows = program.locator('[data-program-row]:visible');
  const total = await rows.count();
  await form.getByLabel('Actividad', { exact: true }).fill('AJEDRÉZ');
  expect(await rows.count()).toBeGreaterThan(0);
  expect(await rows.count()).toBeLessThan(total);
  const location = await rows.first().getAttribute('data-location');
  const day = await rows.first().getAttribute('data-day');
  const time = await rows.first().getAttribute('data-start');
  await form
    .getByRole('combobox', { name: 'Aula o zona', exact: true })
    .selectOption(location!);
  await form
    .getByRole('combobox', { name: 'Día', exact: true })
    .selectOption(day!);
  await form.getByLabel('A las', { exact: true }).fill(time!);
  expect(await rows.count()).toBeGreaterThan(0);
  for (const row of await rows.all()) {
    await expect(row).toHaveAttribute('data-name', /ajedrez/i);
    await expect(row).toHaveAttribute('data-location', location!);
    await expect(row).toHaveAttribute('data-day', day!);
  }
  await form.getByRole('button', { name: 'Restablecer' }).click();
  await expect(rows).toHaveCount(total);
});

test('Una búsqueda con HTML se trata como texto y ofrece recuperación', async ({
  page,
}) => {
  await page.goto('/info/horarios/');
  const program = page.locator('[data-program]');
  await program
    .getByLabel('Actividad', { exact: true })
    .fill('<img src=x onerror="window.ulpInjected=true">');
  await expect(program.locator('[data-program-empty]')).toBeVisible();
  expect(
    await page.evaluate(() => (window as any).ulpInjected),
  ).toBeUndefined();
  await expect(program.locator('img')).toHaveCount(0);
  await program.getByRole('button', { name: 'Restablecer' }).click();
  await expect(program.locator('[data-program-empty]')).not.toBeVisible();
});

test('El programa se adapta a 360 px y sigue disponible sin JavaScript', async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/info/horarios/');
  const program = page.locator('[data-program]');
  expect(await program.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await staticPage.goto('http://127.0.0.1:4323/info/horarios/');
  expect(
    await staticPage.locator('[data-program-row]').count(),
  ).toBeGreaterThan(20);
  await expect(staticPage.locator('[data-program-filters]')).not.toBeVisible();
  await staticContext.close();
});

test('La agenda distingue inscripciones cerradas de actividades sin inscripción', async ({
  page,
}) => {
  await page.goto('/info/horarios/');
  const program = page.locator('[data-program]');
  await expect(program.locator('.program-kicker')).toHaveText('Agenda');
  const total = await program.locator('[data-program-row]').count();
  await expect(program.locator('[data-program-count]')).toHaveText(
    `${total} de ${total} actividades`,
  );
  await expect(
    program.getByRole('columnheader', { name: 'Inscripción', exact: true }),
  ).toBeVisible();
  const chess = program.locator('[data-program-row][data-name="Ajedrez"]');
  await expect(
    chess.getByRole('button', { name: 'Inscripción cerrada para Ajedrez' }),
  ).toBeDisabled();
  await expect(program.locator('.program-registration a')).toHaveCount(0);
  expect(
    await program.getByLabel('No requiere inscripción').count(),
  ).toBeGreaterThan(0);
});
