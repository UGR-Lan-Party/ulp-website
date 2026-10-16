import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('Las flechas muestran tres competiciones y cierran el recorrido sin duplicados en móvil', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const carousel = page.locator('[data-experience-carousel]');
  await expect(carousel.getByRole('link')).toHaveCount(3);
  const visible = carousel.locator('[data-visible]');
  const firstId = await carousel.getAttribute('data-first-activity');
  const count = await carousel.locator('.experience-slide').count();
  expect(count).toBeGreaterThan(3);
  await carousel
    .getByRole('button', { name: 'Competiciones anteriores' })
    .click();
  await expect(carousel).not.toHaveAttribute('data-first-activity', firstId!);
  await expect(carousel.getByRole('link')).toHaveCount(3);
  await carousel
    .getByRole('button', { name: 'Competiciones siguientes' })
    .click();
  await expect(carousel).toHaveAttribute('data-first-activity', firstId!);
  for (let index = 0; index < count; index++) {
    await carousel
      .getByRole('button', { name: 'Competiciones siguientes' })
      .click();
    await expect(carousel).toHaveAttribute('aria-busy', 'false');
    await expect(visible).toHaveCount(3);
  }
  await expect(carousel).toHaveAttribute('data-first-activity', firstId!);
  expect(
    new Set(
      await carousel
        .locator('.experience-slide')
        .evaluateAll((slides) =>
          slides.map((slide) => (slide as HTMLElement).dataset.activityId),
        ),
    ).size,
  ).toBe(count);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(carousel.getByRole('link')).toHaveCount(3);
    const viewport = (await carousel
      .locator('.experience-viewport')
      .boundingBox())!;
    for (const slide of await visible.all()) {
      const box = (await slide.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(viewport.x - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(
        viewport.x + viewport.width + 1,
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('El carrusel avanza a los cinco segundos, se pausa al interactuar y respeta movimiento reducido', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/');
  const carousel = page.locator('[data-experience-carousel]');
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(carousel).toHaveAttribute('data-rotation', 'running');
  const firstId = await carousel.getAttribute('data-first-activity');
  await page.clock.fastForward(4500);
  await expect(carousel).toHaveAttribute('data-first-activity', firstId!);
  await page.clock.fastForward(500);
  await page.clock.runFor(700);
  await expect(carousel).not.toHaveAttribute('data-first-activity', firstId!);
  const rotated = await carousel.getAttribute('data-first-activity');
  await carousel.hover();
  await expect(carousel).toHaveAttribute('data-rotation', 'paused');
  await page.clock.fastForward(10000);
  await expect(carousel).toHaveAttribute('data-first-activity', rotated!);
  await page.mouse.move(0, 0);
  await carousel.getByRole('link').first().focus();
  await expect(carousel).toHaveAttribute('data-rotation', 'paused');
  await page.clock.fastForward(10000);
  await expect(carousel).toHaveAttribute('data-first-activity', rotated!);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await carousel
    .getByRole('button', { name: 'Competiciones siguientes' })
    .click();
  await expect(carousel).not.toHaveAttribute('data-first-activity', rotated!);
  await expect(carousel.locator('[data-experience-pause]')).toHaveCount(0);
});

test('La Alhambra llega a los bordes y los enlaces y títulos conservan los cambios solicitados', async ({
  page,
}) => {
  await page.goto('/');
  const memory = page.locator('.memory-section');
  const silhouette = memory.locator('.alhambra-silhouette');
  await expect(silhouette).toHaveAttribute('aria-hidden', 'true');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const box = (await silhouette.boundingBox())!;
    expect(Math.abs(box.x)).toBeLessThan(1);
    expect(Math.abs(box.width - width)).toBeLessThan(1);
    const gallery = (await memory.locator('.memory-gallery').boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(gallery.y + 1);
    expect(
      await silhouette.evaluate(
        (element) => getComputedStyle(element).maskImage,
      ),
    ).toContain('linear-gradient');
  }
  await page.goto('/actividades/');
  await expect(page.locator('#retos a[href="/actividades/f1"] h3')).toHaveText(
    'Fórmula 1',
  );
  await page.goto('/participan/');
  await expect(
    page
      .locator('.partner-invitation')
      .getByRole('link', { name: 'Contáctanos' }),
  ).toHaveAttribute('href', 'mailto:ulp@ugr.es');
});
