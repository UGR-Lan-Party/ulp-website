import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({
      status: 200,
      body: '',
      contentType:
        route.request().resourceType() === 'stylesheet'
          ? 'text/css'
          : 'text/html',
    }),
  );
});

test('La portada anuncia 2027 y dirige al catálogo', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('#home');
  await expect(hero.getByText('ULP 2027', { exact: true })).toBeVisible();
  await expect(
    hero.getByText('Próximamente ...', { exact: true }),
  ).toBeVisible();
  await expect(
    hero.getByRole('link', { name: 'Inscripciones', exact: true }),
  ).toHaveAttribute('href', '/actividades');
});

test('Los datos de contacto son enlaces y el mapa tiene esquinas redondeadas', async ({
  page,
}) => {
  await page.goto('/contacto/');
  await expect(
    page
      .locator('#contact')
      .getByRole('link', { name: 'ulp@ugr.es', exact: true }),
  ).toHaveAttribute('href', 'mailto:ulp@ugr.es');
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'ulp@ugr.es', exact: true }),
  ).toHaveAttribute('href', 'mailto:ulp@ugr.es');
  await expect(
    page.locator('#contact a').filter({ hasText: 'Periodista Daniel' }),
  ).toHaveAttribute('href', /maps.app.goo.gl/);
  const radius = await page
    .locator('#contact iframe')
    .evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
  expect(radius).toBeGreaterThan(0);
});

test('Los enlaces visibles del CSIRC están centrados y tienen icono', async ({
  page,
}) => {
  await page.goto('/participan/');
  const card = page
    .locator('section[id="sponsor-card"]')
    .filter({ has: page.locator('[data-name="CSIRC"]') });
  const links = card.locator('a');
  await expect(links).toHaveCount(3);
  const boxes = await links.evaluateAll((elements) =>
    elements.map((el) => ({
      x: el.getBoundingClientRect().x,
      width: el.getBoundingClientRect().width,
      hasIcon: Boolean(el.querySelector('svg')),
    })),
  );
  expect(boxes.every((box) => box.hasIcon)).toBe(true);
  const bounds = await card.boundingBox();
  const start = boxes[0].x;
  const last = boxes.at(-1)!;
  expect(
    Math.abs(
      (start + last.x + last.width) / 2 - (bounds!.x + bounds!.width / 2),
    ),
  ).toBeLessThan(2);
});
