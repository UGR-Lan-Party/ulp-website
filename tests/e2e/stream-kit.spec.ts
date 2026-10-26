import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
for (const width of [320, 390, 1440])
  test(`El kit permite probar capas y descargar por juego a ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/info/streamers/');
    const header = (await page.locator('.ud-header').boundingBox())!;
    const back = (await page
      .getByRole('link', { name: 'Recursos de comunicación', exact: false })
      .boundingBox())!;
    expect(back.y).toBeGreaterThan(header.y + header.height + 8);
    await page.locator('[data-stream-archive] > summary').click();
    const visible = page.locator('[data-stream-profile]:visible');
    await expect(visible).toHaveCount(1);
    await expect(visible).toHaveAttribute('data-stream-profile', 'general');
    await page.getByRole('link', { name: 'Ver kit de Minecraft' }).click();
    await expect(visible).toHaveAttribute('data-stream-profile', 'minecraft');
    const stage = visible.locator('[data-stream-stage]');
    await expect(stage.locator('[data-layer=fondo-minecraft]')).toBeVisible();
    await visible
      .getByRole('checkbox', { name: 'Rótulo', exact: true })
      .uncheck();
    await expect(stage.locator('[data-kind=rotulo]')).toBeHidden();
    await visible
      .getByRole('button', { name: 'Ver transparencia', exact: true })
      .click();
    await expect(stage.locator('[data-kind=fondo]')).toBeHidden();
    await expect(stage).toHaveAttribute('data-transparent', 'true');
    await expect(stage.locator('[data-kind=overlay]')).toBeVisible();
    await visible
      .getByRole('button', { name: 'Ver composición', exact: true })
      .click();
    await visible
      .getByRole('checkbox', { name: 'Rótulo', exact: true })
      .check();
    await visible
      .getByRole('button', { name: 'Ampliar vista previa de Minecraft' })
      .click();
    const dialog = page.getByRole('dialog', {
      name: 'Minecraft · Vista previa',
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-kind=fondo]')).toHaveAttribute(
      'src',
      /originales\/fondo-minecraft.png/,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await page.getByRole('link', { name: 'Ver kit de Rocket League' }).focus();
    await page.keyboard.press('Enter');
    await expect(visible).toHaveAttribute(
      'data-stream-profile',
      'rocket-league',
    );
    await expect(visible.locator('[data-layer=overlay-rocket]')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await visible
      .getByRole('link', { name: 'Descargar pack', exact: false })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      'ulp-stream-rocket-league-2026.zip',
    );
    const bytes = await readFile((await download.path())!),
      original = await readFile(
        'public/assets/streamers/2026/ulp-stream-rocket-league-2026.zip',
      );
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      createHash('sha256').update(original).digest('hex'),
    );
    await visible.screenshot({
      path: info.outputPath(`stream-kit-${width}.png`),
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
test('Los enlaces profundos y el catálogo siguen siendo útiles sin JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4323/info/streamers/#lol');
  await page.locator('[data-stream-archive] > summary').click();
  await expect(page.locator('[data-stream-profile]')).toHaveCount(4);
  for (const profile of await page.locator('[data-stream-profile]').all())
    await expect(profile).toBeVisible();
  await page
    .getByText('Todos los archivos originales', { exact: false })
    .click();
  await expect(page.locator('.stream-all a[download]')).toHaveCount(7);
  await context.close();
});
test('El juego de la URL se restaura y el selector admite teclado', async ({
  page,
}) => {
  await page.goto('/info/streamers/#lol');
  await page.locator('[data-stream-archive] > summary').click();
  await expect(page.locator('[data-stream-profile]:visible')).toHaveAttribute(
    'data-stream-profile',
    'lol',
  );
  await page.locator('[data-stream-game=lol]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-stream-profile]:visible')).toHaveAttribute(
    'data-stream-profile',
    'minecraft',
  );
  await page.reload();
  await page
    .locator('[data-stream-archive]')
    .evaluate((el: HTMLDetailsElement) => {
      el.open = true;
    });
  await expect(page.locator('[data-stream-profile]:visible')).toHaveAttribute(
    'data-stream-profile',
    'minecraft',
  );
});
