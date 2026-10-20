import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (r) =>
    r.fulfill({
      status: 200,
      body: '',
      contentType:
        r.request().resourceType() === 'script'
          ? 'application/javascript'
          : 'text/html',
    }),
  );
});
test('Compartir agenda genera un QR y la importación pide confirmación y conserva lo anterior', async ({
  page,
  context,
  browser,
}) => {
  await page.goto('/actividades/ajedrez/');
  await page.locator('[data-agenda-toggle]').first().click();
  await page.goto('/info/horarios/#mi-agenda');
  await page
    .getByRole('button', { name: 'Compartir agenda', exact: true })
    .click();
  const dialog = page.locator('[data-agenda-share-dialog]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-agenda-qr]')).toBeVisible();
  const url = await dialog.locator('input').inputValue();
  expect(url).toContain('#agenda=v1.2026.');
  expect(url).not.toContain('ajedrez');
  await page.keyboard.press('Escape');
  await page.goto('/actividades/league-of-legends/');
  await page.locator('[data-agenda-toggle]').first().click();
  const before = await page.evaluate(() =>
    localStorage.getItem('ulp-agenda:2026:v1'),
  );
  await page.goto(url);
  await expect(dialog).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('ulp-agenda:2026:v1')),
  ).toBe(before);
  await expect(dialog.locator('[data-agenda-incoming-list]')).toContainText(
    'Ajedrez',
  );
  await dialog
    .getByRole('button', { name: 'Aceptar todo', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('[data-agenda-list]')).toContainText(
    'League of Legends',
  );
  await expect(page.locator('[data-agenda-list]')).toContainText('Ajedrez');
});
test('Una agenda manipulada no altera la selección ni interpreta HTML', async ({
  page,
}) => {
  await page.goto('/actividades/ajedrez/');
  await page.locator('[data-agenda-toggle]').first().click();
  const before = await page.evaluate(() =>
    localStorage.getItem('ulp-agenda:2026:v1'),
  );
  await page.goto('/info/horarios/#agenda=<img%20src=x%20onerror=alert(1)>');
  await expect(page.locator('[data-agenda-link-error]')).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('ulp-agenda:2026:v1')),
  ).toBe(before);
  await expect(page.locator('[data-agenda-share-dialog]')).not.toBeVisible();
});
test('La agenda compartida permite decidir por actividad, cancelar sin cambios y aceptar todo', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const activity of ['ajedrez', 'f1']) {
    await page.goto(`/actividades/${activity}/`);
    await page.locator('[data-agenda-toggle]').first().click();
  }
  await page.goto('/info/horarios/#mi-agenda');
  await page
    .getByRole('button', { name: 'Compartir agenda', exact: true })
    .click();
  const dialog = page.locator('[data-agenda-share-dialog]');
  const url = await dialog.locator('[data-agenda-share-url]').inputValue();
  await page.evaluate(() => localStorage.removeItem('ulp-agenda:2026:v1'));
  await page.goto('/actividades/league-of-legends/');
  await page.locator('[data-agenda-toggle]').first().click();
  const before = await page.evaluate(() =>
    localStorage.getItem('ulp-agenda:2026:v1'),
  );
  await page.goto(url);
  const chess = dialog
    .locator('.incoming-activity')
    .filter({ hasText: 'Ajedrez' });
  const formula = dialog
    .locator('.incoming-activity')
    .filter({ hasText: 'Fórmula 1' });
  await expect(dialog.locator('[data-agenda-import-selected]')).toBeDisabled();
  await chess.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await formula.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await expect(chess).toHaveAttribute('data-decision', 'accepted');
  await expect(formula).toHaveAttribute('data-decision', 'rejected');
  await expect(dialog.locator('[data-agenda-import-selected]')).toHaveText(
    'Guardar selección (1)',
  );
  expect(
    await page.evaluate(() => localStorage.getItem('ulp-agenda:2026:v1')),
  ).toBe(before);
  await page.keyboard.press('Escape');
  expect(
    await page.evaluate(() => localStorage.getItem('ulp-agenda:2026:v1')),
  ).toBe(before);
  await page.reload();
  await chess.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await chess.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await expect(dialog.locator('[data-agenda-import-selected]')).toBeDisabled();
  await chess.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await formula.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await dialog.locator('[data-agenda-import-selected]').click();
  await expect(dialog).not.toBeVisible();
  const agenda = page.locator('[data-agenda-list]');
  await expect(agenda).toContainText('League of Legends');
  await expect(agenda).toContainText('Ajedrez');
  await expect(agenda).not.toContainText('Fórmula 1');
  await page.goto(url);
  await formula.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await dialog
    .getByRole('button', { name: 'Aceptar todo', exact: true })
    .click();
  await expect(agenda).toContainText('Fórmula 1');
  await expect(agenda).toContainText('League of Legends');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
