import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

for (const width of [320, 390, 1440]) {
  test(`Los mapas propios conservan el destino y los dos servicios a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of ['/contacto/', '/info/localizacion/']) {
      await page.goto(path);
      const preview = page.locator('[data-location-preview]');
      await expect(preview.getByRole('img')).toHaveAccessibleName(/ETSIIT/);
      await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(
        0,
      );
      await expect(
        preview.getByRole('link', { name: 'Google Maps' }),
      ).toHaveAttribute('href', 'https://maps.app.goo.gl/8c9WLkYAiw6cJRgu7');
      await expect(
        preview.getByRole('link', { name: 'Apple Maps' }),
      ).toHaveAttribute('href', /maps.apple.com.*37.19704,-3.6245/);
      await expect(
        preview.getByRole('link', { name: /Explorar el plano/ }),
      ).toHaveAttribute('href', '/info/mapa/#plano');
      await expect(
        preview.getByRole('link', { name: /OpenStreetMap/ }),
      ).toBeVisible();
      await expect(preview.locator('.map-campus path')).toHaveCount(1);
      await expect(preview.locator('.destination-label')).toHaveCount(0);
      for (const dark of [false, true]) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          dark,
        );
        await preview.scrollIntoViewIfNeeded();
        await preview.screenshot({
          path: testInfo.outputPath(
            `${path.includes('contacto') ? 'contact' : 'location'}-${width}-${dark ? 'dark' : 'light'}.png`,
          ),
        });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      const uni = page.locator('.footer-university');
      await expect(uni).toHaveText('@ Universidad de Granada');
      await expect(page.locator('.footer-credit-date')).not.toContainText('@');
    }
  });

  test(`La banda de fotos navega con rueda, flechas y visor completo a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const images = [
      '/assets/about/sobre-nosotros.png',
      '/assets/about/sobre-nosotros-2.png',
      '/assets/about/ulp-2025-retro.jpg',
      '/assets/about/ulp-2025-comunidad.jpg',
      '/assets/about/ulp-2023-comunidad.jpg',
      '/assets/blog/ULP2025.png',
      '/assets/activities/etsiit.jpg',
    ];
    await page.route('http://127.0.0.1:4323/', async (route) => {
      const response = await route.fetch();
      const sources = JSON.stringify(images).replaceAll('"', '&quot;');
      const body = (await response.text())
        .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
        .replace(
          /data-(photos|previews)="[^"]*"/g,
          (_, key) => `data-${key}="${sources}"`,
        );
      await route.fulfill({ response, body });
    });
    await page.goto('/');
    const album = page.locator('.memory-gallery [data-photo-carousel]');
    const stage = album.locator('[data-carousel-stage]');
    await expect(
      stage.locator('[data-carousel-next], [data-carousel-previous]'),
    ).toHaveCount(0);
    await expect(album.locator('[data-carousel-counter]')).toHaveCSS(
      'clip-path',
      'inset(50%)',
    );
    await stage.scrollIntoViewIfNeeded();
    await expect(album.locator('[data-carousel-neighbor]:visible')).toHaveCount(
      6,
    );
    await expect
      .poll(() =>
        album
          .locator('[data-carousel-image]')
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    await stage.screenshot({
      path: testInfo.outputPath(`ribbon-${width}.png`),
    });
    await stage.hover();
    const originalScroll = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 120);
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 2 de 7',
    );
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - originalScroll),
    ).toBeLessThan(2);
    await expect
      .poll(() =>
        stage
          .locator('[data-ribbon-offset="0"]')
          .evaluate((el) => el.getAnimations().length),
      )
      .toBe(0);
    await page.mouse.wheel(120, 0);
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 3 de 7',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await album.locator('[data-carousel-zoom]').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(album.locator('[data-carousel-counter]')).toHaveText(
      'Foto 2 de 7',
    );
    await album.locator('[data-carousel-zoom]').click();
    const viewer = album.locator('dialog');
    await expect(viewer).toBeVisible();
    await expect(album.locator('[data-carousel-expanded]')).toHaveCSS(
      'object-fit',
      'contain',
    );
    await expect(album.locator('[data-carousel-original]')).toHaveAttribute(
      'href',
      images[1],
    );
    await viewer.locator('[data-expanded-next]').click();
    await expect(viewer.locator('[data-expanded-counter]')).toHaveText(
      'Foto 3 de 7',
    );
    await expect(album.locator('[data-carousel-original]')).toHaveAttribute(
      'href',
      images[2],
    );
    await viewer.screenshot({
      path: testInfo.outputPath(`viewer-${width}.png`),
    });
    await page.keyboard.press('Escape');
    await expect(viewer).not.toBeVisible();
    await expect(album.locator('[data-carousel-zoom]')).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
