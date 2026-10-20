import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

for (const width of [1400, 390]) {
  test(`Los rangos de patrocinio se pliegan por separado con ratón y teclado a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/participan/');
    const groups = page.locator('.partner-disclosure');
    for (const group of await groups.all())
      await expect(group).toHaveAttribute('open');
    await expect(page.locator('.partner-group h2 span')).toHaveCount(0);
    const first = groups.first();
    const second = groups.nth(1);
    const summary = first.locator('summary');
    await summary.click();
    await expect(first).not.toHaveAttribute('open');
    await expect(first.locator('.partner-tier-grid')).toBeHidden();
    await expect(second.locator('.partner-tier-grid')).toBeVisible();
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(first.locator('.partner-tier-grid')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(first).not.toHaveAttribute('open');
    const id = await first.locator('..').getAttribute('id');
    await page.locator(`.tier-navigation a[href="#${id}"]`).click();
    await expect(first).toHaveAttribute('open');
  });
}

test('Arrastrar el plano ampliado evita selección y recuadros sin perder el foco de teclado', async ({
  page,
}) => {
  await page.goto('/info/horarios/');
  await page.locator('[data-venue-building-select]').selectOption('principal');
  const drawing = page.locator('[data-venue-drawing]');
  await drawing.scrollIntoViewIfNeeded();
  await page
    .getByRole('button', { name: 'Acercar plano', exact: true })
    .click();
  const bounds = (await drawing.boundingBox())!;
  const before = await drawing.getAttribute('viewBox');
  await page.mouse.move(
    bounds.x + bounds.width * 0.45,
    bounds.y + bounds.height * 0.5,
  );
  await page.mouse.down();
  await expect(drawing).toHaveAttribute('data-panning');
  await page.mouse.move(
    bounds.x + bounds.width * 0.6,
    bounds.y + bounds.height * 0.6,
    { steps: 8 },
  );
  await expect(drawing).not.toHaveAttribute('viewBox', before!);
  await expect(drawing).toHaveCSS('outline-style', 'none');
  await expect(drawing.locator('[data-venue-building]')).toHaveCSS(
    'pointer-events',
    'none',
  );
  expect(await page.evaluate(() => getSelection()?.toString())).toBe('');
  await page.mouse.up();
  await expect(drawing).not.toHaveAttribute('data-panning');
  await drawing.focus();
  await page.keyboard.press('ArrowRight');
  await expect(drawing).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'aria-busy',
    'false',
  );
});

test('La rotación mantiene las etiquetas orientadas y termina sin saltos ni animaciones pendientes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/info/horarios/');
  await page.locator('[data-venue-building-select]').selectOption('principal');
  const map = page.locator('[data-venue-map]');
  const building = page.locator('[data-venue-building]');
  await building.evaluate((element) => {
    const animate = element.animate.bind(element);
    element.animate = (keyframes, options) => {
      const animation = animate(keyframes, options);
      animation.pause();
      return animation;
    };
  });
  for (let turn = 1; turn <= 4; turn++) {
    await page
      .getByRole('button', { name: 'Rotar plano', exact: true })
      .click();
    await expect(map).toHaveAttribute('aria-busy', 'true');
    const value = await building.evaluate((element) => {
      const animation = element.getAnimations()[0];
      animation.currentTime = 310;
      const angle = parseFloat(
        getComputedStyle(element).getPropertyValue('--venue-label-turn'),
      );
      animation.play();
      return angle;
    });
    expect(Math.abs(value % 90)).toBeGreaterThan(1);
    expect(Math.abs(value % 90)).toBeLessThan(89);
    await expect(map).toHaveAttribute('aria-busy', 'false');
    await expect(map).toHaveAttribute('data-orientation', String(turn % 4));
    expect(
      await building.evaluate((element) => element.getAnimations().length),
    ).toBe(0);
  }
});
