import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const width of [320, 390, 1440]) {
  test(`Mapa independiente, stands, voluntariado y footer a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/info/horarios/');
    await expect(page.locator('[data-venue-map]')).toHaveCount(0);
    await expect(page.locator('[data-program-filters]')).toBeVisible();
    await page
      .getByRole('link', { name: 'Ver mapa y rutas entre aulas' })
      .click();
    await expect(page).toHaveURL(/info\/mapa/);
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-venue-plan',
      'recinto',
    );
    await expect(page.locator('[data-program]')).toHaveCount(0);
    await page.locator('[data-venue-building-select]').selectOption('aulario');
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-venue-plan',
      'aulario-0',
    );
    await expect(page.locator('[data-route-panel]')).toBeVisible();
    await page.goto('/info/stands/');
    const intro = (await page
      .locator('.stands-heading .design-eyebrow')
      .boundingBox())!;
    const header = (await page.locator('.ud-header').boundingBox())!;
    expect(intro.y).toBeGreaterThan(header.y + header.height);
    await expect(page.locator('[data-stand-card] h3')).toHaveCount(7);
    await expect(page.locator('[data-stand-card]')).toHaveCount(7);
    await page
      .getByRole('button', { name: 'Videojuegos', exact: true })
      .click();
    await expect(page.locator('[data-stand-card]:visible')).toHaveCount(2);

    await expect(page.locator('[data-stand-status]')).toHaveText(
      '2 stands · Videojuegos',
    );
    await page.getByRole('button', { name: 'Todos', exact: true }).click();
    await expect(page.locator('[data-stand-card]:visible')).toHaveCount(7);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto('/');
    await expect(page.locator('[data-volunteer-link]')).toHaveAttribute(
      'href',
      /1FAIpQLSfrAkLpaCSWpBiKVxkS5UfOUoZOtOEYTwSLVV_gbnUu9LQUhg/,
    );
    const socials = page.locator('.footer-social-links');
    await socials.scrollIntoViewIfNeeded();
    const boxes = await socials.locator('a').evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width };
      }),
    );
    const bounds = (await socials.boundingBox())!;
    expect(
      Math.abs(
        (boxes[0].x + boxes[6].x + boxes[6].width) / 2 -
          bounds.x -
          bounds.width / 2,
      ),
    ).toBeLessThan(1);
    if (width <= 700)
      expect(boxes.every((b) => Math.abs(b.y - boxes[0].y) < 1)).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
test('Los enlaces antiguos al plano redirigen conservando la planta solicitada', async ({
  page,
}) => {
  await page.goto('/info/horarios/?plano=principal-estudiantes#plano');
  await expect(page).toHaveURL(
    /info\/mapa\/\?plano=principal-estudiantes#plano/,
  );
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'principal-estudiantes',
  );
});
test.describe('Gesto táctil continuo', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  test('La banda sigue el dedo y cambia la foto central aunque una lateral tarde en cargar', async ({
    page,
  }) => {
    const pictures = [
      '/assets/about/sobre-nosotros.png',
      '/assets/about/sobre-nosotros-2.png',
      '/assets/about/ulp-2025-retro.jpg',
      '/slow-neighbor.png',
      '/assets/about/ulp-2025-comunidad.jpg',
      '/assets/about/ulp-2023-comunidad.jpg',
      '/assets/blog/ULP2025.png',
    ];
    await page.route('**/slow-neighbor.png', async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await r.fulfill({ status: 503, body: '' });
    });
    await page.route('http://127.0.0.1:4323/', async (r) => {
      const response = await r.fetch();
      const data = JSON.stringify(pictures).replaceAll('"', '&quot;');
      const body = (await response.text())
        .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
        .replace(
          /data-(photos|previews)="[^"]*"/g,
          (_, key) => `data-${key}="${data}"`,
        );
      await r.fulfill({ response, body });
    });
    await page.goto('/');
    const gallery = page.locator('.memory-gallery [data-photo-carousel]');
    const stage = gallery.locator('[data-carousel-stage]');
    const photo = gallery.locator('[data-carousel-zoom]');
    await stage.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        gallery
          .locator('[data-carousel-image]')
          .evaluate(
            (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
          ),
      )
      .toBe(true);
    const box = (await stage.boundingBox())!;
    const x = box.x + box.width * 0.6,
      y = box.y + box.height * 0.5;
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, id: 1 }],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x - 60, y, id: 1 }],
    });
    await expect
      .poll(() =>
        photo.evaluate((el) => parseFloat(getComputedStyle(el).translate)),
      )
      .toBeLessThan(-30);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await expect(gallery.locator('[data-carousel-counter]')).toHaveText(
      'Foto 2 de 7',
      { timeout: 1500 },
    );
    await expect(gallery.locator('dialog')).not.toBeVisible();
    await expect
      .poll(() => photo.evaluate((el) => el.getAnimations().length))
      .toBe(0);
    await session.detach();
  });
});
