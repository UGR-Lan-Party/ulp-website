import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

for (const route of ['/', '/actividades/', '/participan/', '/contacto/']) {
  test(`La propuesta conserva el contenido accesible y cabe en 390 px: ${route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const links = page.locator('a[href="javascript:void(0)"]');
    expect(await links.count()).toBe(0);
    expect(errors).toEqual([]);
  });
}
