import { test, expect } from '@playwright/test';
for (const width of [320, 390, 1440])
  test(`El contorno no se solapa y el mapa permite zoom, arrastre y teclado a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://**', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const path of ['/contacto/', '/info/localizacion/']) {
      await page.goto(path);
      const root = page.locator('[data-location-preview]');
      const canvas = root.locator('[data-location-canvas]');
      const drawing = root.locator('[data-location-drawing]');
      await canvas.scrollIntoViewIfNeeded();
      await expect(root.locator('.destination-label')).toHaveCount(0);
      const boundary = root.locator('.map-campus path');
      await expect(boundary).toHaveCount(1);
      expect((await boundary.getAttribute('d'))!.match(/M/g)).toHaveLength(1);
      await expect(drawing).toHaveAttribute('viewBox', '0 0 800 600');
      await expect(
        root.getByRole('button', { name: 'Alejar mapa', exact: true }),
      ).toBeDisabled();
      await root.screenshot({
        path: testInfo.outputPath(
          `map-${width}-${path.includes('contacto') ? 'contact' : 'location'}.png`,
        ),
      });
      await drawing.hover();
      const scrollBefore = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, -500);
      await expect(drawing).not.toHaveAttribute('viewBox', '0 0 800 600');
      expect(
        parseInt(await root.locator('[data-location-zoom-value]').innerText()),
      ).toBeGreaterThan(100);
      expect(
        Math.abs((await page.evaluate(() => scrollY)) - scrollBefore),
      ).toBeLessThan(2);
      const zoomed = await drawing.getAttribute('viewBox');
      const rect = (await drawing.boundingBox())!;
      await page.mouse.move(
        rect.x + rect.width * 0.5,
        rect.y + rect.height * 0.65,
      );
      await page.mouse.down();
      await page.mouse.move(
        rect.x + rect.width * 0.5 + 30,
        rect.y + rect.height * 0.65 + 20,
        { steps: 4 },
      );
      await page.mouse.up();
      await expect(drawing).not.toHaveAttribute('viewBox', zoomed!);
      await canvas.focus();
      await canvas.press('0');
      await expect(drawing).toHaveAttribute('viewBox', '0 0 800 600');
      await canvas.press('+');
      await expect(root.locator('[data-location-zoom-value]')).toHaveText(
        '140%',
      );
      for (let i = 0; i < 8; i++) await canvas.press('+');
      await expect(root.locator('[data-location-zoom-value]')).toHaveText(
        '600%',
      );
      await expect(
        root.getByRole('button', { name: 'Acercar mapa', exact: true }),
      ).toBeDisabled();
      const value = (await drawing.getAttribute('viewBox'))!
        .split(' ')
        .map(Number);
      expect(value[0]).toBeGreaterThanOrEqual(0);
      expect(value[1]).toBeGreaterThanOrEqual(0);
      expect(value[0] + value[2]).toBeLessThanOrEqual(800.01);
      expect(value[1] + value[3]).toBeLessThanOrEqual(600.01);
      await canvas.screenshot({
        path: testInfo.outputPath(
          `zoomed-${width}-${path.includes('contacto') ? 'contact' : 'location'}.png`,
        ),
      });
      await root
        .getByRole('button', { name: 'Restablecer zoom del mapa' })
        .click();
      await expect(drawing).toHaveAttribute('viewBox', '0 0 800 600');
      await expect(
        root.getByRole('link', { name: 'Google Maps' }),
      ).toBeVisible();
      await expect(
        root.getByRole('link', { name: 'Apple Maps' }),
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
