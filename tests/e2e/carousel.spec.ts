import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', route => route.fulfill({ status: 200, body: '' }));
  await page.route('**/info/ediciones_anteriores/', async route => {
    const response = await route.fetch();
    const sources = JSON.stringify(['/assets/about/sobre-nosotros.png', '/assets/about/sobre-nosotros-2.png']).replaceAll('"', '&quot;');
    const html = (await response.text()).replace(/data-photos="[^"]*"/g, `data-photos="${sources}"`);
    await route.fulfill({ response, body: html });
  });
});

test('Cada álbum navega de forma independiente y amplía con cierre y Escape', async ({ page }) => {
  await page.goto('/info/ediciones_anteriores/');
  const albums = page.locator('[data-photo-carousel]');
  const first = albums.nth(0);
  const second = albums.nth(1);
  await expect(first.locator('[data-carousel-counter]')).toHaveText('Foto 1 de 2');
  await first.getByRole('button', { name: 'Foto siguiente', exact: true }).click();
  await expect(first.locator('[data-carousel-image]')).toHaveAttribute('src', /sobre-nosotros-2/);
  await expect(second.locator('[data-carousel-counter]')).toHaveText('Foto 1 de 2');
  await first.getByRole('link', { name: 'Ampliar foto 2', exact: true }).click();
  const dialog = first.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Foto anterior ampliada' }).click();
  await expect(first.locator('[data-carousel-expanded]')).toHaveAttribute('src', /sobre-nosotros.png$/);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(first.locator('[data-carousel-zoom]')).toBeFocused();
  await first.locator('[data-carousel-zoom]').click();
  await dialog.getByRole('button', { name: 'Cerrar foto ampliada' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(first.getByRole('link', { name: 'Ver el álbum completo en Flickr' })).toHaveAttribute('href', /flickr.com/);
});

test('El carrusel se adapta al móvil y no depende de movimiento automático', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/ediciones_anteriores/');
  const first = page.locator('[data-photo-carousel]').first();
  const box = await first.locator('[data-carousel-stage]').boundingBox();
  expect(box!.width).toBeLessThanOrEqual(360);
  await first.getByRole('button', { name: 'Foto anterior', exact: true }).click();
  await expect(first.locator('[data-carousel-counter]')).toHaveText('Foto 2 de 2');
  await first.locator('[data-carousel-zoom]').click();
  await expect(first.getByRole('dialog')).toBeVisible();
  await first.getByRole('button', { name: 'Cerrar foto ampliada' }).click();
});
