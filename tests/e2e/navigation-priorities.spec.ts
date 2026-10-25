import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});
for (const width of [1280, 390]) {
  test(`La navegación prioriza actividades y horarios y el tablón cabe en una línea a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/blog/');
    const names = await page
      .locator('.navigation-list > li')
      .evaluateAll((items) =>
        items
          .map((item) =>
            item.querySelector('.navigation-link')?.textContent?.trim(),
          )
          .filter(Boolean),
      );
    expect(names.slice(0, 3)).toEqual(['Inicio', 'Actividades', 'Información']);
    expect(await page.locator('.submenu a').allTextContents()).toEqual([
      'Horarios',
      'Mapa',
      'Stands',
      'Localización',
      'Sobre nosotros',
      'Redes sociales',
      'Ediciones anteriores',
      'FAQs',
      'Aviso legal',
    ]);
    const title = page.locator('h1');
    await expect(title).toHaveText('El tablón de la ULP');
    const lines = await title.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getClientRects().length;
    });
    expect(lines).toBe(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  });
}
