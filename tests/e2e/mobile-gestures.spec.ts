import { test, expect } from '@playwright/test';
import { swipe } from './helpers/touch';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('Deslizar las competiciones cambia las tres tarjetas sin navegar por accidente', async ({
  page,
}) => {
  await page.goto('/');
  const carousel = page.locator('[data-experience-carousel]');
  const first = await carousel.getAttribute('data-first-activity');
  await expect(carousel.locator('[data-experience-next]')).toBeHidden();
  await swipe(page, carousel.locator('.experience-viewport'), 1);
  await expect(carousel).not.toHaveAttribute('data-first-activity', first!);
  await expect(carousel.locator('[data-visible]')).toHaveCount(3);
  await expect(page).toHaveURL(/4323\/$/);
  await swipe(page, carousel.locator('.experience-viewport'), -1);
  await expect(carousel).toHaveAttribute('data-first-activity', first!);
});

for (const path of ['/', '/info/about/', '/info/ediciones_anteriores/']) {
  test(`Las fotos admiten gestos y zoom sin botones de avance en móvil: ${path}`, async ({
    page,
  }) => {
    await page.route(`http://127.0.0.1:4323${path}`, async (route) => {
      const response = await route.fetch();
      const sources = JSON.stringify([
        '/assets/about/sobre-nosotros.png',
        '/assets/about/sobre-nosotros-2.png',
      ]).replaceAll('"', '&quot;');
      const body = (await response.text())
        .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
        .replace(
          /data-(photos|previews)="[^"]*"/g,
          (_, key) => `data-${key}="${sources}"`,
        );
      await route.fulfill({ response, body });
    });
    await page.goto(path);
    const album = page.locator('[data-photo-carousel]').first();
    const stage = album.locator('[data-carousel-stage]');
    await expect(album.locator('[data-carousel-next]')).toBeHidden();
    await swipe(page, stage, 1);
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 2 de 2',
    );
    await expect(album.locator('dialog')).not.toBeVisible();
    await album.locator('[data-carousel-zoom]').tap();
    const dialog = album.locator('dialog');
    await expect(dialog).toBeVisible();
    await expect(album.locator('[data-expanded-next]')).toBeHidden();
    await swipe(page, dialog, -1);
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 1 de 2',
    );
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-carousel-close]').tap();
    await expect(dialog).not.toBeVisible();
    const box = (await album.locator('[data-carousel-zoom]').boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(4 / 3, 2);
  });
}

test('El plano móvil permite seleccionar, volver a tocar para quitar el filtro, ampliar y desplazar', async ({
  page,
}) => {
  await page.goto('/info/horarios/');
  const point = page.locator('[data-venue-zone="hall"] [data-venue-point]');
  const zone = page.locator('[data-venue-zone="hall"]');
  await point.scrollIntoViewIfNeeded();
  await point.tap();
  await expect(zone).toHaveAttribute('aria-pressed', 'true');
  await expect(zone.locator('[data-venue-label]')).toBeVisible();
  const label = (await zone.locator('[data-venue-label]').boundingBox())!;
  expect(label.x).toBeGreaterThanOrEqual(0);
  expect(label.x + label.width).toBeLessThanOrEqual(390);
  await expect(page.locator('[data-program-row]:visible')).toHaveCount(6);
  await point.tap();
  await expect(zone).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-program-row]:visible')).toHaveCount(46);
  const drawing = page.locator('[data-venue-drawing]');
  const original = await drawing.getAttribute('viewBox');
  await page.getByRole('button', { name: 'Acercar plano', exact: true }).tap();
  await expect(page.locator('[data-venue-zoom-value]')).toHaveText('150%');
  const zoomed = await drawing.getAttribute('viewBox');
  await swipe(page, drawing, 1);
  await expect(drawing).not.toHaveAttribute('viewBox', zoomed!);
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-orientation',
    '0',
  );
  await page.getByRole('button', { name: 'Restablecer zoom del plano' }).tap();
  await expect(drawing).toHaveAttribute('viewBox', original!);
  const bounds = (await drawing.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const points = (distance: number) => [
    {
      id: 1,
      x: bounds.x + bounds.width / 2 - distance,
      y: bounds.y + bounds.height / 2,
    },
    {
      id: 2,
      x: bounds.x + bounds.width / 2 + distance,
      y: bounds.y + bounds.height / 2,
    },
  ];
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: points(35),
  });
  for (let distance = 42; distance <= 70; distance += 7) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: points(distance),
    });
    await page.waitForTimeout(45);
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await session.detach();
  await expect(page.locator('[data-venue-zoom-value]')).toHaveText('200%');
  await expect(
    page.locator('[data-venue-building-select] option:checked'),
  ).toHaveText('Edificio Principal');
  await expect(page.locator('[data-venue-map]')).not.toContainText(
    'Consultar referencia',
  );
});

test('Los filtros no se solapan a 320px y el pie móvil conserva los enlaces sociales', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/info/horarios/');
  const time = (await page.getByLabel('A las', { exact: true }).boundingBox())!;
  const reset = (await page
    .getByRole('button', { name: 'Restablecer', exact: true })
    .boundingBox())!;
  const filterBounds = (await page
    .locator('[data-program-filters]')
    .boundingBox())!;
  expect(time.x).toBeGreaterThanOrEqual(filterBounds.x);
  expect(time.x + time.width).toBeLessThanOrEqual(
    filterBounds.x + filterBounds.width,
  );
  await page.getByLabel('A las', { exact: true }).fill('23:59');
  const filledTime = (await page
    .getByLabel('A las', { exact: true })
    .boundingBox())!;
  expect(filledTime.x + filledTime.width).toBeLessThanOrEqual(
    filterBounds.x + filterBounds.width,
  );
  expect(reset.y).toBeGreaterThanOrEqual(time.y + time.height);
  await expect(
    page.locator('footer a[href="/actividades#competiciones"]'),
  ).toBeHidden();
  await expect(page.locator('footer a[href="/info/aviso_legal"]')).toBeHidden();
  await expect(page.locator('.footer-social-links a')).toHaveCount(7);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('El home mantiene el orden Discord, preguntas y noticias sin Twitch y usa iconos SVG', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.twitch-section')).toHaveCount(0);
  const positions = await page.evaluate(() =>
    ['.community-cta', '.faq-section', '.home-news'].map(
      (selector) =>
        document.querySelector(selector)!.getBoundingClientRect().top,
    ),
  );
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  await expect(
    page.locator('.hero-actions .arrow-up-right').first(),
  ).toBeAttached();
  expect(await page.locator('main').innerText()).not.toContain('↗');
});
