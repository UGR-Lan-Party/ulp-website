import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

for (const width of [320, 390, 1440]) {
  test(`El blog y sus noticias mantienen la lectura, enlaces y temas a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/blog/');
    await expect(page.locator('h1')).toHaveText('El tablón de la ULP');
    const stories = await page
      .locator('.news-card > a')
      .evaluateAll((nodes) =>
        nodes.map((node) => (node as HTMLAnchorElement).getAttribute('href')!),
      );
    expect(new Set(stories).size).toBe(stories.length);
    expect(stories.length).toBe(4);
    for (const dark of [false, true]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle('dark', dark),
        dark,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator('.news-index').screenshot({
        path: testInfo.outputPath(
          `blog-${width}-${dark ? 'dark' : 'light'}.png`,
        ),
      });
    }
    for (const story of stories) {
      await page.goto(story);
      await expect(page.locator('article h1')).toBeVisible();
      await expect(page.locator('.article-body')).not.toBeEmpty();
      await expect(page.locator('.article-byline')).toContainText(
        'min de lectura',
      );
      const body = (await page.locator('.article-body').boundingBox())!;
      expect(body.width).toBeLessThanOrEqual(width > 700 ? 800 : width - 32);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const image = page.locator('.article-figure img');
      await expect
        .poll(() =>
          image.evaluate(
            (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
          ),
        )
        .toBe(true);
      await expect(image).toHaveCSS('object-fit', 'contain');
      await expect(
        page.getByRole('link', { name: 'Descargar imagen original' }),
      ).toHaveAttribute('download', '');
    }
    await page.goto(stories[0]);
    await page.screenshot({
      path: testInfo.outputPath(`article-${width}-light.png`),
      fullPage: true,
    });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.screenshot({
      path: testInfo.outputPath(`article-${width}-dark.png`),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });

  test(`El footer alinea sus tres elementos y mantiene Universidad de Granada sin partir a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/blog/');
    const footer = page.locator('.ulp-footer');
    await footer.scrollIntoViewIfNeeded();
    const university = footer.locator('.footer-university');
    await expect(university).toHaveAttribute('href', 'https://www.ugr.es/');
    await expect(university).toHaveCSS('white-space', 'nowrap');
    await university.hover();
    await expect(university).toHaveCSS('text-decoration-line', 'underline');
    if (width < 701) {
      const centers = await footer
        .locator('.footer-credit, .footer-resources a')
        .evaluateAll((nodes) =>
          nodes.map((el) => {
            const b = el.getBoundingClientRect();
            return b.y + b.height / 2;
          }),
        );
      expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(1);
      const date = (await footer.locator('.footer-credit-date').boundingBox())!;
      const uni = (await university.boundingBox())!;
      expect(date.y + date.height).toBeLessThanOrEqual(uni.y + 1);
    }
    await footer.screenshot({
      path: testInfo.outputPath(`footer-${width}.png`),
    });
  });
}

for (const width of [320, 390])
  test(`El visor móvil ofrece botones debajo de la imagen, cierre compacto y colores de ediciones a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.route('**/info/ediciones_anteriores/', async (route) => {
      const response = await route.fetch();
      const sources = JSON.stringify([
        '/assets/about/sobre-nosotros.png',
        '/assets/about/sobre-nosotros-2.png',
      ]).replaceAll('"', '&quot;');
      const body = (await response.text())
        .replace(/data-shuffle-photos(?:="[^"]*")?/g, '')
        .replace(
          /data-(photos|previews)="[^"]*"/g,
          (_, key) => `data-${key}="${sources}"`,
        );
      await route.fulfill({ response, body });
    });
    await page.goto('/info/ediciones_anteriores/');
    const colors = await page
      .locator('.edition-timeline li:not(.timeline-pause) strong')
      .evaluateAll((nodes) =>
        nodes.map((node) => getComputedStyle(node).color),
      );
    expect(new Set(colors).size).toBe(8);
    await page
      .locator('.edition-timeline')
      .screenshot({ path: testInfo.outputPath(`timeline-${width}.png`) });
    const album = page.locator('[data-photo-carousel]').first();
    await album.locator('[data-carousel-zoom]').click();
    const dialog = album.locator('dialog');
    await expect(dialog).toBeVisible();
    const photo = (await album
      .locator('[data-carousel-expanded]')
      .boundingBox())!;
    for (const selector of [
      '[data-expanded-previous]',
      '[data-expanded-next]',
    ]) {
      const button = album.locator(selector);
      await expect(button).toBeVisible();
      const box = (await button.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(photo.y + photo.height);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(
      (await album.locator('[data-carousel-close]').boundingBox())!.width,
    ).toBeLessThan(40);
    const frame = (await dialog.boundingBox())!;
    expect(Math.abs(frame.height - photo.height - 106)).toBeLessThan(2);
    await album.locator('[data-expanded-next]').click();
    await expect(album.locator('[data-expanded-counter]')).toHaveText(
      'Foto 2 de 2',
    );
    await album.locator('[data-expanded-previous]').click();
    await expect(album.locator('[data-expanded-counter]')).toHaveText(
      'Foto 1 de 2',
    );
    await dialog.screenshot({
      path: testInfo.outputPath(`viewer-${width}.png`),
    });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(album.locator('[data-carousel-zoom]')).toBeFocused();
  });
