import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) => {
    const type = route.request().resourceType();
    return route.fulfill({
      status: 200,
      body: '',
      contentType:
        type === 'stylesheet'
          ? 'text/css'
          : type === 'script'
            ? 'application/javascript'
            : 'text/html',
    });
  });
});

for (const route of ['/', '/actividades/ajedrez/', '/participan/', '/blog/']) {
  test(`Primera visita sin preferencias: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        !message.text().startsWith('Permissions policy violation:')
      )
        errors.push(message.text());
    });
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.getByRole('button', { name: 'Modo oscuro' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(errors).toEqual([]);
  });
}

test('Información se recorre y se cierra con teclado', async ({ page }) => {
  await page.goto('/actividades/ajedrez/');
  const information = page.getByRole('button', { name: 'Información' });
  await information.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Horarios', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(information).toBeFocused();
  await expect(information).toHaveAttribute('aria-expanded', 'false');
});

test('El visor no descarga Three.js ni modelos antes de abrirlo', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/actividades/ajedrez/');
  await expect(page.locator('[data-trophy-preview]')).toBeVisible();
  expect(
    requests.filter(
      (url) =>
        url.includes('/assets/models/') || url.includes('/trophy-scene.'),
    ),
  ).toEqual([]);
});

test('El menú móvil anuncia su estado y devuelve el foco', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/actividades/ajedrez/');
  const menu = page.getByRole('button', { name: 'Menú principal' });
  await menu.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('El horario permanece legible con movimiento reducido', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/horarios/');
  const cards = page.locator('.activity-card, .sab-activity-card');
  expect(await cards.count()).toBeGreaterThan(3);
  for (const card of await cards.all()) {
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).toHaveCSS('position', 'relative');
  }
});
