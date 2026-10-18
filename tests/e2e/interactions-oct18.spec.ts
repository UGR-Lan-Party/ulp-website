import { test, expect } from '@playwright/test';
import { swipe } from './helpers/touch';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('La rueda amplía el plano sin desplazar la página y el botón Rotar recorre las cuatro vistas', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/horarios/');
  const drawing = page.locator('[data-venue-drawing]');
  const map = page.locator('[data-venue-map]');
  const controls = page.locator('[data-venue-controls]');
  await expect(controls.getByRole('button')).toHaveCount(1);
  await drawing.scrollIntoViewIfNeeded();
  const bounds = (await drawing.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.6,
    bounds.y + bounds.height * 0.5,
  );
  const before = await drawing.getAttribute('viewBox');
  const pageY = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -240);
  await expect(drawing).not.toHaveAttribute('viewBox', before!);
  const percentage = Number(
    (await page.locator('[data-venue-zoom-value]').innerText()).replace(
      '%',
      '',
    ),
  );
  expect(percentage).toBeGreaterThan(100);
  expect(await page.evaluate(() => scrollY)).toBe(pageY);
  await page.mouse.wheel(0, 100);
  await expect
    .poll(async () =>
      Number(
        (await page.locator('[data-venue-zoom-value]').innerText()).replace(
          '%',
          '',
        ),
      ),
    )
    .toBeLessThan(percentage);
  await page
    .getByRole('button', { name: 'Restablecer zoom del plano' })
    .click();
  await expect(drawing).toHaveAttribute('viewBox', before!);
  for (const orientation of [1, 2, 3, 0]) {
    await page
      .getByRole('button', { name: 'Rotar plano', exact: true })
      .click();
    await expect(map).toHaveAttribute('data-orientation', String(orientation));
  }
  const button = (await controls.boundingBox())!;
  const legend = (await page
    .locator('[data-venue-floor-note="principal-0"]')
    .boundingBox())!;
  expect(legend.y - button.y - button.height).toBeGreaterThanOrEqual(24);
});

test.describe('Interacciones táctiles', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test('La carta cambia de ángulo al tocar y arrastrar y vuelve a reposo al soltar', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/actividades/hacking/');
    const card = page.locator('#holo-card');
    await card.scrollIntoViewIfNeeded();
    const bounds = (await card.boundingBox())!;
    const session = await page.context().newCDPSession(page);
    const y = bounds.y + bounds.height * 0.4;
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: bounds.x + bounds.width * 0.2, y }],
    });
    await expect
      .poll(() => card.evaluate((element) => element.style.transform))
      .toContain('rotate3d');
    const initial = await card.evaluate((element) => element.style.transform);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: bounds.x + bounds.width * 0.8, y }],
    });
    await expect
      .poll(() => card.evaluate((element) => element.style.transform))
      .not.toBe(initial);
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await expect
      .poll(() => card.evaluate((element) => element.style.transform))
      .toBe('');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: bounds.x + bounds.width * 0.2, y }],
    });
    await expect(card).toHaveCSS('transform', 'none');
    expect(await card.evaluate((element) => element.style.transform)).toBe('');
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await session.detach();
  });

  test('Los partners reanudan su avance tras deslizar y mantienen la pausa de teclado', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const strip = page.locator('[data-partner-strip]');
    const viewport = strip.locator('[data-partner-viewport]');
    await viewport.scrollIntoViewIfNeeded();
    await expect(strip).toHaveAttribute('data-rotation', 'running');
    await swipe(page, viewport, 1);
    await expect(strip).toHaveAttribute('data-rotation', 'paused');
    await expect(strip).toHaveAttribute('data-rotation', 'running', {
      timeout: 7000,
    });
    const position = await viewport.evaluate((element) => element.scrollLeft);
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(position + 3);
    await viewport.focus();
    await page.keyboard.press('Tab');
    await expect(strip).toHaveAttribute('data-rotation', 'paused');
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expect(strip).toHaveAttribute('data-rotation', 'running');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(strip).toHaveAttribute('data-rotation', 'paused');
  });
});
