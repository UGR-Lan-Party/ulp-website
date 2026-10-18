import { test, expect } from '@playwright/test';

async function changePhoto(
  root: import('@playwright/test').Locator,
  direction: -1 | 1,
) {
  const expanded = (await root.getAttribute('data-carousel-dialog')) !== null;
  if ((root.page().viewportSize()?.width ?? 1440) <= 700) {
    await (expanded ? root : root.locator('[data-carousel-zoom]')).press(
      direction > 0 ? 'ArrowRight' : 'ArrowLeft',
    );
    return;
  }
  await root
    .getByRole('button', {
      name: `Foto ${direction > 0 ? 'siguiente' : 'anterior'}${expanded ? ' ampliada' : ''}`,
      exact: true,
    })
    .click();
}

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
    const html = (await response.text())
      .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
      .replace(
        /data-(photos|previews)="[^"]*"/g,
        (_, attribute) => `data-${attribute}="${sources}"`,
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
  await changePhoto(first, 1);
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
  await changePhoto(dialog, -1);
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
  await changePhoto(first, -1);
  await expect(first.locator('[data-carousel-counter]')).toHaveText(
    'Foto 2 de 2',
  );
  await first.locator('[data-carousel-zoom]').click();
  await expect(first.getByRole('dialog')).toBeVisible();
  await first.getByRole('button', { name: 'Cerrar foto ampliada' }).click();
});

for (const width of [1440, 360]) {
  test(`El marco conserva 4:3 y amplía la foto completa a ${width} px`, async ({
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
          return Math.abs(box.width / box.height - 4 / 3);
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
      await changePhoto(first, 1);
      await expect(first.locator('[data-carousel-counter]')).toHaveText(
        `Foto ${((index + 1) % 2) + 1} de 2`,
      );
    }
    const stageBox = (await first
      .locator('[data-carousel-stage]')
      .boundingBox())!;
    const albumBox = (await first
      .getByRole('link', { name: 'Ver álbum completo' })
      .boundingBox())!;
    expect(
      Math.abs(
        stageBox.x + stageBox.width / 2 - albumBox.x - albumBox.width / 2,
      ),
    ).toBeLessThan(1);
    expect(albumBox.y).toBeGreaterThan(stageBox.y + stageBox.height);
    expect(albumBox.height).toBeLessThan(40);
    await expect(first.locator('.zoom-hint')).toHaveText('');
    await expect(first.locator('.zoom-hint svg')).toBeVisible();
  });
}

for (const width of [1440, 390]) {
  test(`La galería del home muestra tres fotos y sincroniza laterales, flechas y zoom a ${width} px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('http://127.0.0.1:4323/', async (route) => {
      const response = await route.fetch();
      const photos = [
        '/assets/about/sobre-nosotros.png',
        '/assets/about/sobre-nosotros-2.png',
        '/assets/about/ulp-2025-retro.jpg',
      ];
      const sources = JSON.stringify(photos).replaceAll('"', '&quot;');
      const html = (await response.text())
        .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
        .replace(
          /data-(photos|previews)="[^"]*"/g,
          (_, attribute) => `data-${attribute}="${sources}"`,
        );
      await route.fulfill({ response, body: html });
    });
    await page.goto('/');
    const album = page.locator('.memory-gallery [data-photo-carousel]');
    await album.scrollIntoViewIfNeeded();
    const previous = album.locator('.neighbor-previous');
    const next = album.locator('.neighbor-next');
    await expect(album.locator('[data-carousel-neighbor]')).toHaveCount(2);
    await expect(next.locator('img')).toHaveAttribute(
      'src',
      /sobre-nosotros-2/,
    );
    await expect(previous.locator('img')).toHaveAttribute(
      'src',
      /ulp-2025-retro/,
    );
    const center = (await album.locator('[data-carousel-zoom]').boundingBox())!;
    const side = (await next.boundingBox())!;
    expect(Math.abs(center.width / center.height - 4 / 3)).toBeLessThan(0.01);
    expect(Math.abs(side.width / side.height - 4 / 3)).toBeLessThan(0.01);
    await expect(album.locator('[data-carousel-image]')).toHaveCSS(
      'object-fit',
      'cover',
    );
    expect(side.width / center.width).toBeGreaterThan(0.92);
    expect(side.width / center.width).toBeLessThan(0.96);
    await expect(next).toHaveCSS('opacity', '0.42');
    await next.click();
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 2 de 3',
    );
    await expect(previous.locator('img')).toHaveAttribute(
      'src',
      /sobre-nosotros.png$/,
    );
    await changePhoto(album, 1);
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 3 de 3',
    );
    await album
      .getByRole('link', { name: 'Ampliar foto 3', exact: true })
      .click();
    const dialog = album.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await changePhoto(dialog, 1);
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 1 de 3',
    );
    await expect(next.locator('img')).toHaveAttribute(
      'src',
      /sobre-nosotros-2/,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(album.locator('[data-carousel-zoom]')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 3 de 3',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('Una carga lenta conserva la foto actual y varios clics rápidos muestran solo la última solicitada', async ({
  page,
}) => {
  let release: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/sobre-nosotros-2.png', async (route) => {
    await delayed;
    await route.continue();
  });
  await page.route('http://127.0.0.1:4323/', async (route) => {
    const response = await route.fetch();
    const sources = JSON.stringify([
      '/assets/about/sobre-nosotros.png',
      '/assets/about/sobre-nosotros-2.png',
      '/assets/about/ulp-2025-retro.jpg',
    ]).replaceAll('"', '&quot;');
    const html = (await response.text())
      .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
      .replace(
        /data-(photos|previews)="[^"]*"/g,
        (_, attribute) => `data-${attribute}="${sources}"`,
      );
    await route.fulfill({ response, body: html });
  });
  await page.goto('/');
  const album = page.locator('.memory-gallery [data-photo-carousel]');
  const image = album.locator('[data-carousel-image]');
  await expect(album.locator('[data-carousel-counter]')).toHaveText(
    'Foto 1 de 3',
  );
  await changePhoto(album, 1);
  await expect(album).toHaveAttribute('aria-busy', 'true');
  await expect(image).toHaveAttribute('src', /sobre-nosotros.png$/);
  await expect(album.locator('[data-carousel-counter]')).toHaveText(
    'Foto 1 de 3',
  );
  await changePhoto(album, 1);
  release!();
  await expect(album.locator('[data-carousel-counter]')).toHaveText(
    'Foto 3 de 3',
  );
  await expect(image).toHaveAttribute('src', /ulp-2025-retro.jpg$/);
  await expect(album).toHaveAttribute('aria-busy', 'false');
  expect(
    await image.evaluate(
      (element: HTMLImageElement) =>
        element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true);
});

for (const width of [1440, 390]) {
  test(`Las fotos verticales se recortan a 4:3 y se amplían completas a ${width} px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/portrait-fixture.svg', (route) =>
      route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000"><rect width="600" height="1000" fill="#004465"/></svg>',
      }),
    );
    await page.route('http://127.0.0.1:4323/', async (route) => {
      const response = await route.fetch();
      const sources = JSON.stringify([
        '/portrait-fixture.svg',
        '/assets/about/sobre-nosotros.png',
      ]).replaceAll('"', '&quot;');
      const html = (await response.text())
        .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
        .replace(
          /data-(photos|previews)="[^"]*"/g,
          (_, attribute) => `data-${attribute}="${sources}"`,
        );
      await route.fulfill({ response, body: html });
    });
    await page.goto('/');
    const album = page.locator('.memory-gallery [data-photo-carousel]');
    const image = album.locator('[data-carousel-image]');
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalHeight),
      )
      .toBe(1000);
    await expect(image).toHaveCSS('object-fit', 'cover');
    await expect(image).toHaveCSS('object-position', '50% 50%');
    const preview = (await album
      .locator('[data-carousel-zoom]')
      .boundingBox())!;
    expect(Math.abs(preview.width / preview.height - 4 / 3)).toBeLessThan(0.01);
    await album.locator('[data-carousel-zoom]').click();
    const dialog = album.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const expanded = album.locator('[data-carousel-expanded]');
    await expect(expanded).toHaveAttribute('src', '/portrait-fixture.svg');
    await expect(expanded).toHaveCSS('object-fit', 'contain');
    const full = (await dialog.boundingBox())!;
    expect(Math.abs(full.width / full.height - 0.6)).toBeLessThan(0.01);
    await page.keyboard.press('Escape');
    await changePhoto(album, 1);
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 2 de 2',
    );
    const nextPreview = (await album
      .locator('[data-carousel-zoom]')
      .boundingBox())!;
    expect(Math.abs(nextPreview.height - preview.height)).toBeLessThan(1);
  });
}
