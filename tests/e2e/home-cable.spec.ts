import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

for (const width of [1440, 390]) {
  test(`el cable se desdibuja al subir y solo se completa abajo (${width}px)`, async ({
    page,
  }) => {
    const errors: string[] = [];
    await page.setViewportSize({ width, height: 844 });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const cable = page.locator('[data-home-cable][data-ready]');
    await expect(cable).toHaveCount(1);
    await page.locator('#experiencias').scrollIntoViewIfNeeded();
    const gap = () =>
      cable.evaluate((element) =>
        Number((element as HTMLElement).style.getPropertyValue('--cable-gap')),
      );
    await expect
      .poll(async () => {
        const value = await gap();
        return value > 0 && value < 1;
      })
      .toBe(true);
    const initial = await gap();
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect.poll(gap).toBeLessThan(initial - 0.1);
    await page.evaluate(() =>
      scrollTo(0, document.documentElement.scrollHeight - innerHeight - 160),
    );
    await expect.poll(gap).toBeLessThan(0.15);
    expect(await gap()).toBeGreaterThan(0);
    await page.evaluate(() =>
      scrollTo(0, document.documentElement.scrollHeight),
    );
    await expect.poll(gap).toBe(0);
    await page.evaluate(() => scrollBy(0, -160));
    await expect.poll(gap).toBeGreaterThan(0);
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(gap).toBe(1);
    await expect(cable).toHaveCSS('pointer-events', 'none');
    await expect(page.locator('.hero-actions a').first()).toHaveAttribute(
      'href',
      'https://forms.gle/32zwkMrrx2UrLdwx9',
    );
    expect(errors).toEqual([]);
  });
}

test('el cable se adapta al ancho sin crear desplazamiento horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const svg = page.locator('[data-cable-svg]');
  await expect(page.locator('[data-home-cable][data-ready]')).toHaveCount(1);
  for (const width of [320, 768, 1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect
      .poll(() =>
        svg.evaluate(
          (element) => (element as SVGSVGElement).viewBox.baseVal.width,
        ),
      )
      .toBe(width);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const bounds = await page
      .locator('[data-cable-guide]')
      .evaluate((element) => {
        const path = element as SVGPathElement;
        const box = path.getBBox();
        return {
          left: box.x,
          right: box.x + box.width,
          start: path.getPointAtLength(0).x,
          end: path.getPointAtLength(path.getTotalLength()).x,
        };
      });
    expect(bounds.left).toBeGreaterThan(0);
    expect(bounds.right).toBeLessThan(width);
    expect(bounds.start).toBeGreaterThan(width / 2);
    expect(bounds.end).toBeLessThan(width / 2);
  }
});

test('con movimiento reducido sigue el scroll sin interpolación ni punta animada', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cable = page.locator('[data-home-cable][data-ready]');
  await expect
    .poll(() =>
      cable.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue('--cable-gap'),
      ),
    )
    .toBe('1');
  await expect(page.locator('[data-cable-tip]')).toHaveCSS('opacity', '0');
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(() =>
      cable.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue('--cable-gap'),
      ),
    )
    .toBe('0');
  await page.evaluate(() => scrollTo(0, 0));
  await expect
    .poll(() =>
      cable.evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue('--cable-gap'),
      ),
    )
    .toBe('1');
});
