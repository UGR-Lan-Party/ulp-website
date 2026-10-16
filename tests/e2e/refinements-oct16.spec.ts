import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('La aleatoriedad conserva portada, parejas de resoluciones y recorrido por sesión', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('ulp-photo-seed'))
      sessionStorage.setItem('ulp-photo-seed', 'revision-oct16');
  });
  const sources = Array.from(
    { length: 8 },
    (_, index) => `/assets/about/sobre-nosotros.png?photo=${index}`,
  );
  const previews = sources.map((source) =>
    source.replace('sobre-nosotros.png', 'sobre-nosotros-2.png'),
  );
  await page.route('**/info/about/', async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      /data-(photos|previews)="[^"]*"/g,
      (_, attribute) =>
        `data-${attribute}="${JSON.stringify(attribute === 'photos' ? sources : previews).replaceAll('"', '&quot;')}"`,
    );
    await route.fulfill({ response, body: html });
  });
  await page.goto('/info/about/');
  const album = page.locator('.community-album [data-photo-carousel]');
  await expect(album.locator('[data-carousel-next]')).toBeVisible();
  await expect(album.locator('[data-carousel-neighbor]')).toHaveCount(2);
  const order = await album.evaluate((element) =>
    JSON.parse((element as HTMLElement).dataset.photos!),
  );
  expect(order[0]).toBe(sources[0]);
  expect(new Set(order).size).toBe(8);
  expect(order).not.toEqual(sources);
  const pairedPreviews = await album.evaluate((element) =>
    JSON.parse((element as HTMLElement).dataset.previews!),
  );
  expect(
    pairedPreviews.map((url: string) =>
      new URL(url, 'http://localhost').searchParams.get('photo'),
    ),
  ).toEqual(
    order.map((url: string) =>
      new URL(url, 'http://localhost').searchParams.get('photo'),
    ),
  );
  await album
    .getByRole('button', { name: 'Foto siguiente', exact: true })
    .click();
  await expect(album.locator('[data-carousel-image]')).toHaveAttribute(
    'src',
    order[1],
  );
  await page.reload();
  await expect(album.locator('[data-carousel-next]')).toBeVisible();
  expect(
    await album.evaluate((element) =>
      JSON.parse((element as HTMLElement).dataset.photos!),
    ),
  ).toEqual(order);
  await expect(album.locator('[data-carousel-image]')).toHaveAttribute(
    'src',
    sources[0],
  );
  await page.evaluate(() =>
    sessionStorage.setItem('ulp-photo-seed', 'otra-sesion'),
  );
  await page.reload();
  await expect(album.locator('[data-carousel-next]')).toBeVisible();
  const otherOrder = await album.evaluate((element) =>
    JSON.parse((element as HTMLElement).dataset.photos!),
  );
  expect(otherOrder[0]).toBe(sources[0]);
  expect(otherOrder).not.toEqual(order);
});

test('La sección de prensa y el foco de luz de colaboradores funcionan en ambos temas', async ({
  page,
}) => {
  await page.goto('/contacto/');
  const press = page.locator('.press-section');
  await expect(
    press.getByRole('heading', { name: /La ULP,.*también es noticia/ }),
  ).toBeVisible();
  await expect(press).toContainText('Archivo 2026');
  await expect(
    press.getByRole('link', { name: 'Contactar con prensa' }),
  ).toHaveAttribute('href', /^mailto:ulp@ugr.es\?/);
  expect(
    await press.evaluate((element) =>
      Boolean(
        document.querySelector('#contact')?.compareDocumentPosition(element)! &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ),
  ).toBe(true);
  await expect(press.locator('a[href$=".pdf"]')).toHaveCount(0);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(press).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/participan/');
  for (const tier of ['diamond', 'platinum', 'regular']) {
    const card = page
      .locator(`[data-partner-card][data-tier="${tier}"]`)
      .first();
    await card.hover({ position: { x: 40, y: 50 } });
    await expect
      .poll(() =>
        card.evaluate(
          (element) => getComputedStyle(element, '::before').opacity,
        ),
      )
      .toBe('1');
    expect(
      await card.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue('--pointer-x'),
      ),
    ).not.toBe('');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const card = page.locator('[data-partner-card]').first();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
});
