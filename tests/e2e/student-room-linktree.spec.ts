import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const width of [1440, 390]) {
  test(`La sala de estudiantes permite explorar los tableros y volver a su planta a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/info/horarios/');
    await page
      .locator('[data-venue-building-select]')
      .selectOption('principal');
    await page
      .locator('[data-venue-floor-select]')
      .selectOption('principal-baja');
    const marker = page.locator('[data-venue-zone="estudiantes"]');
    await expect(marker).toHaveAttribute(
      'aria-label',
      'Abrir plano: Sala de estudiantes',
    );
    await marker.focus();
    await page.keyboard.press('Enter');
    const map = page.locator('[data-venue-map]');
    const plan = page.locator(
      '[data-venue-floor-plan="principal-estudiantes"]',
    );
    await expect(map).toHaveAttribute(
      'data-venue-plan',
      'principal-estudiantes',
    );
    await expect(plan).toBeVisible();
    await expect(page.locator('[data-venue-room-title]')).toHaveText(
      'Sala de estudiantes',
    );
    await expect(
      page.locator('select option[value="principal-estudiantes"]'),
    ).toHaveCount(0);
    await expect(plan.locator('.floor-desk')).toHaveCount(9);
    await expect(plan.locator('.floor-seat')).toHaveCount(32);
    await expect(plan.locator('[data-chess-board]')).toHaveCount(16);
    await expect(plan.locator('[data-chess-board] use')).toHaveCount(16 * 32);
    await plan.scrollIntoViewIfNeeded();
    await page
      .locator('[data-venue-drawing]')
      .screenshot({ path: testInfo.outputPath(`student-room-${width}.png`) });
    const logo = plan.locator('[data-venue-external]');
    await expect(logo).toHaveAttribute('href', 'https://x.com/AMATugr');
    await logo.focus();
    await expect(logo.locator('.amat-tooltip')).toBeVisible();
    const closer = page.getByRole('button', {
      name: 'Acercar plano',
      exact: true,
    });
    for (let step = 0; step < 10; step++) await closer.click();
    await expect(page.locator('[data-venue-zoom-value]')).toHaveText('600%');
    await expect(closer).toBeDisabled();
    const boardWidth = await plan
      .locator('[data-chess-board]')
      .nth(8)
      .evaluate((node) => node.getBoundingClientRect().width);
    expect(boardWidth).toBeGreaterThan(100);
    await page.locator('[data-venue-drawing]').screenshot({
      path: testInfo.outputPath(`student-room-zoom-${width}.png`),
    });
    await page
      .getByRole('button', { name: 'Restablecer zoom del plano' })
      .click();
    await page.locator('[data-venue-room-back]').click();
    await expect(map).toHaveAttribute('data-venue-plan', 'principal-baja');
    await expect(marker).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

  test(`Linktree muestra móvil y mano sin desbordamientos a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/info/rrss/');
    const section = page.locator('[data-linktree-showcase]');
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading')).toHaveText(
      'Toda la ULP.En tu mano.',
    );
    await expect(section.locator('.preview-phone')).toBeVisible();
    await expect(section.locator('.hand-back')).toBeVisible();
    await expect(
      section.getByRole('link', { name: 'Explora nuestro Linktree' }),
    ).toHaveAttribute('href', 'https://linktr.ee/ulpugr');
    await expect(section.locator('.phone-links a')).toHaveCount(5);
    const image = section.locator('.phone-profile img');
    await expect(image).toBeVisible();
    expect(
      await image.evaluate(
        (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
      ),
    ).toBe(true);
    const bounds = await section.locator('.linktree-stage').boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(580);
    const copyFits = await section
      .locator('.showcase-copy')
      .evaluate((node) => {
        const parent = node.closest('.linktree-stage')!.getBoundingClientRect();
        const bounds = node.getBoundingClientRect();
        return bounds.left >= parent.left && bounds.right <= parent.right;
      });
    expect(copyFits).toBe(true);
    await section.screenshot({
      path: testInfo.outputPath(`linktree-${width}.png`),
    });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await section.screenshot({
      path: testInfo.outputPath(`linktree-dark-${width}.png`),
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('La sala ampliada también se puede abrir con un enlace directo', async ({
  page,
}) => {
  await page.goto('/info/horarios/?plano=principal-estudiantes');
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'principal-estudiantes',
  );
  await expect(page.locator('[data-venue-floor-select]')).toHaveValue(
    'principal-baja',
  );
  await expect(
    page.locator(
      '[data-venue-floor-plan="principal-estudiantes"] [data-chess-board]',
    ),
  ).toHaveCount(16);
});

test('La mano y el móvil se balancean al entrar en pantalla y respetan el movimiento reducido', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/info/rrss/');
  const section = page.locator('[data-linktree-showcase]');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute('data-phone-visible', '');
  const phone = section.locator('.phone-held');
  await page.mouse.move(0, 0);
  await expect(phone).toHaveCSS('animation-play-state', 'running');
  const phoneBounds = (await phone.boundingBox())!;
  await page.mouse.move(
    phoneBounds.x + phoneBounds.width / 2,
    phoneBounds.y + phoneBounds.height / 2,
  );
  await expect(phone).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(phone).toHaveCSS('animation-name', 'none');
  await expect(section.locator('.phone-links a').first()).toHaveCSS(
    'animation-name',
    'none',
  );
});
