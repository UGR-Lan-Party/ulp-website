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

test('La portada anuncia 2027 y dirige a su encuesta inicial', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('#home');
  await expect(hero.getByText('ULP 2027', { exact: true })).toBeVisible();
  await expect(
    hero.getByText('Próximamente ...', { exact: true }),
  ).toBeVisible();
  await expect(
    hero.getByRole('link', { name: 'Encuesta Inicial', exact: true }),
  ).toHaveAttribute('href', 'https://forms.gle/32zwkMrrx2UrLdwx9');
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
    .locator('#contact [data-location-preview]')
    .evaluate((el) => parseFloat(getComputedStyle(el).borderRadius));
  expect(radius).toBeGreaterThan(0);
});

test('Los enlaces visibles del CSIRC están centrados y tienen icono', async ({
  page,
}) => {
  await page.goto('/participan/');
  const card = page
    .locator('[data-partner-card]')
    .filter({ has: page.locator('[data-name="CSIRC"]') });
  const links = card.locator('a');
  await expect(links).toHaveCount(4);
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

test('Los iconos de las entidades permanecen blancos al ampliar en hover y en ambos temas', async ({
  page,
}) => {
  await page.goto('/participan/');
  await page.evaluate(() => document.fonts.ready);
  const links = page.locator('[data-partner-card] a');
  for (let index = 0; index < 2; index++) {
    expect(await links.count()).toBeGreaterThan(10);
    const colors = await links.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).color),
    );
    expect(colors.every((color) => color === 'rgb(245, 240, 230)')).toBe(true);
    const instagram = links.filter({ has: page.locator('svg') }).first();
    await instagram.evaluate((element) =>
      element.scrollIntoView({ block: 'center' }),
    );
    await instagram.hover();
    await expect(instagram).toHaveCSS('color', 'rgb(245, 240, 230)');
    await expect
      .poll(() =>
        instagram.evaluate(
          (element) => new DOMMatrix(getComputedStyle(element).transform).a,
        ),
      )
      .toBeGreaterThan(1);
    await page.getByRole('button', { name: 'Modo oscuro' }).click();
  }
});

test('Las entidades muestran hasta cuatro enlaces y las nuevas redes tienen icono', async ({
  page,
}) => {
  await page.goto('/participan/');
  const cards = page.locator('[data-partner-card]');
  for (const card of await cards.all()) {
    const links = card.locator('.partner-card-links a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(4);
    for (const link of await links.all()) {
      await expect(link.locator('svg')).toHaveCount(1);
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  }
  for (const [entity, network, href] of [
    [
      'Cafetería ETSIIT',
      'Instagram',
      'https://www.instagram.com/cafeteriaetsiit/',
    ],
    ['DEFC', 'Instagram', 'https://www.instagram.com/defcugr/'],
    ['DGE', 'Telegram', 'https://t.me/dge_UGR'],
    ['ETSIIT', 'YouTube', 'https://www.youtube.com/@ETSIIT-youtube'],
    ['Hackiit', 'GitHub', 'https://github.com/HackiitUGR'],
  ]) {
    const card = cards.filter({
      has: page.locator(`h3[data-name="${entity}"]`),
    });
    await expect(
      card.getByRole('link', { name: network, exact: true }),
    ).toHaveAttribute('href', href);
  }
});
