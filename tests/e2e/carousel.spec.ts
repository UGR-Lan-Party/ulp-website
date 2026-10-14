import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.route('**/info/ediciones_anteriores/', async (route) => {
    const response = await route.fetch();
    const sources = JSON.stringify([
      '/assets/about/sobre-nosotros.png',
      '/assets/about/sobre-nosotros-2.png',
    ]).replaceAll('"', '&quot;');
    const html = (await response.text()).replace(
      /data-photos="[^"]*"/g,
      `data-photos="${sources}"`,
    );
    await route.fulfill({ response, body: html });
  });
});

test('Cada álbum navega de forma independiente y amplía con cierre y Escape', async ({
  page,
}) => {
  await page.goto('/info/ediciones_anteriores/');
  const albums = page.locator('[data-photo-carousel]');
  const first = albums.nth(0);
  const second = albums.nth(1);
  await expect(first.locator('[data-carousel-counter]')).toHaveText(
    'Foto 1 de 2',
  );
  await first
    .getByRole('button', { name: 'Foto siguiente', exact: true })
    .click();
  await expect(first.locator('[data-carousel-image]')).toHaveAttribute(
    'src',
    /sobre-nosotros-2/,
  );
  await expect(second.locator('[data-carousel-counter]')).toHaveText(
    'Foto 1 de 2',
  );
  await first
    .getByRole('link', { name: 'Ampliar foto 2', exact: true })
    .click();
  const dialog = first.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Foto anterior ampliada' }).click();
  await expect(first.locator('[data-carousel-expanded]')).toHaveAttribute(
    'src',
    /sobre-nosotros.png$/,
  );
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(first.locator('[data-carousel-zoom]')).toBeFocused();
  await first.locator('[data-carousel-zoom]').click();
  await dialog.getByRole('button', { name: 'Cerrar foto ampliada' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    first.getByRole('link', { name: 'Ver álbum completo' }),
  ).toHaveAttribute('href', /flickr.com/);
});

test('El carrusel se adapta al móvil y no depende de movimiento automático', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/ediciones_anteriores/');
  const first = page.locator('[data-photo-carousel]').first();
  const box = await first.locator('[data-carousel-stage]').boundingBox();
  expect(box!.width).toBeLessThanOrEqual(360);
  await first
    .getByRole('button', { name: 'Foto anterior', exact: true })
    .click();
  await expect(first.locator('[data-carousel-counter]')).toHaveText(
    'Foto 2 de 2',
  );
  await first.locator('[data-carousel-zoom]').click();
  await expect(first.getByRole('dialog')).toBeVisible();
  await first.getByRole('button', { name: 'Cerrar foto ampliada' }).click();
});

for (const width of [1440, 360]) {
  test(`El marco sigue la proporción de cada foto sin bandas a ${width} px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/info/ediciones_anteriores/');
    const first = page.locator('[data-photo-carousel]').first();
    const image = first.locator('[data-carousel-image]');
    for (let index = 0; index < 2; index++) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (element: HTMLImageElement) =>
              element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const ratio = await image.evaluate(
        (element: HTMLImageElement) =>
          element.naturalWidth / element.naturalHeight,
      );
      const stage = first.locator('[data-carousel-stage]');
      await expect
        .poll(async () => {
          const box = (await stage.boundingBox())!;
          return Math.abs(box.width / box.height - ratio);
        })
        .toBeLessThan(0.01);
      await first.locator('[data-carousel-zoom]').click();
      const dialog = first.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const box = (await dialog.boundingBox())!;
      expect(Math.abs(box.width / box.height - ratio)).toBeLessThan(0.01);
      expect(box.width).toBeLessThanOrEqual(width);
      expect(box.height).toBeLessThanOrEqual(1000);
      await dialog
        .getByRole('button', { name: 'Cerrar foto ampliada' })
        .click();
      await first
        .getByRole('button', { name: 'Foto siguiente', exact: true })
        .click();
    }
    await expect(first.locator('.zoom-hint')).toHaveText('');
    await expect(first.locator('.zoom-hint svg')).toBeVisible();
  });
}
