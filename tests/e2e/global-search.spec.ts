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
test('Buscador: teclado, consultas literales seguras, noticias y aulas', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Buscar en la web', exact: true })
    .focus();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: '¿Necesitas ayuda?' });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('searchbox');
  await expect(input).toBeFocused();
  await input.fill('formula');
  await expect(dialog.locator('[data-search-results] a').first()).toContainText(
    'Fórmula 1',
  );
  await input.fill('<img src=x onerror="window.xss=1">');
  await expect(dialog.locator('[data-search-results] a')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).xss)).toBeUndefined();
  expect(await dialog.locator('[data-search-results] img').count()).toBe(0);
  await input.fill('Have Fun');
  await expect(dialog.locator('[data-search-results] a').first()).toContainText(
    'Noticia',
  );
  await input.fill('aula -1.1');
  await expect(dialog.locator('[data-search-results] a').first()).toContainText(
    'Espacio',
  );
  await page.keyboard.press('ArrowDown');
  await expect(dialog.locator('[data-search-results] a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Buscar en la web', exact: true }),
  ).toBeFocused();
});
test('El resultado de una pregunta abre su respuesta y el aula abre su plano', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await page.locator('[data-search-input]').fill('premios');
  const result = page
    .locator('[data-search-results] a')
    .filter({ hasText: '¿Habrá premios' });
  await result.click();
  await expect(page.locator('#pregunta-5')).toHaveAttribute('open', '');
  await page.keyboard.press('Control+k');
  await page.locator('[data-search-input]').fill('aula -1.1');
  await page.locator('[data-search-results] a').first().click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'aulas-inferiores',
  );
});
