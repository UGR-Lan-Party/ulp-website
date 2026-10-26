import { test, expect } from '@playwright/test';

for (const width of [320, 390, 1440]) {
  test(`Los cuatro selectores del plano funcionan con el estilo del nav a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info/mapa/');
    const choose = async (kind: string, value: string) => {
      const button = page.locator(`[data-venue-select="${kind}"]`);
      await button.click();
      const menu = page.locator(
        `#${await button.getAttribute('aria-controls')}`,
      );
      await expect(menu).toBeVisible();
      const bounds = (await menu.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(1001);
      await expect(menu).toHaveCSS('border-radius', '12px');
      await menu.screenshot({
        path: testInfo.outputPath(`${kind}-${width}.png`),
      });
      await menu.locator(`[data-value="${value}"]`).click();
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    };
    await choose('building', 'aulario');
    await choose('floor', 'aulario-1');
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-venue-plan',
      'aulario-1',
    );
    await page.locator('[data-route-panel] summary').click();
    await choose('origin', 'hall');
    await choose('destination', 'aulario-1.2');
    await page
      .locator('[data-route-form]')
      .evaluate((el: HTMLFormElement) => el.requestSubmit());
    await expect(page.locator('[data-route-result]')).toBeVisible();
    await page.locator('[data-route-swap]').click();
    await expect(page.locator('[data-venue-select="origin"]')).toContainText(
      'Aula 1.2',
    );
    const origin = page.locator('[data-venue-select="origin"]');
    await origin.focus();
    await origin.press('ArrowDown');
    const menu = page.locator(`#${await origin.getAttribute('aria-controls')}`);
    await expect(menu).toBeVisible();
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');
    await expect(origin).toContainText('Hall principal');
    await origin.click();
    await page.keyboard.press('Escape');
    await expect(origin).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('Las descripciones del archivo se pliegan en móvil y sus numerales conservan solo el contorno', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.goto('/info/ediciones_anteriores/');
  const descriptions = page.locator('[data-edition-description]');
  expect(await descriptions.count()).toBeGreaterThan(5);
  expect(
    await descriptions.evaluateAll((nodes) =>
      nodes.every((node) => !(node as HTMLDetailsElement).open),
    ),
  ).toBe(true);
  const first = descriptions.first();
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).not.toHaveAttribute('open');
  await expect(page.locator('.archive-year').first()).toHaveCSS(
    'color',
    'rgba(0, 0, 0, 0)',
  );
  await expect(page.locator('.archive-year').first()).toHaveCSS(
    'font-family',
    /Georgia/,
  );
  const footer = page.locator('.ulp-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const button = document
          .querySelector('.back-to-top')!
          .getBoundingClientRect();
        const credits = document
          .querySelector('.footer-copyright')!
          .getBoundingClientRect();
        return button.bottom <= credits.top;
      }),
    )
    .toBe(true);
  await footer.screenshot({ path: testInfo.outputPath('footer-mobile.png') });
  const centers = await page
    .locator('.footer-credit, .footer-resources a')
    .evaluateAll((nodes) =>
      nodes.map((el) => {
        const b = el.getBoundingClientRect();
        return b.y + b.height / 2;
      }),
    );
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThan(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect
    .poll(() =>
      descriptions.evaluateAll((nodes) =>
        nodes.every((node) => (node as HTMLDetailsElement).open),
      ),
    )
    .toBe(true);
});

test('Virtual Soul conserva sus redes sin botón Concierto y los logos del plano mantienen color en ambos temas', async ({
  page,
}) => {
  await page.goto('/participan/');
  await expect(
    page.locator('#partner-virtual-soul .partner-activities'),
  ).toHaveCount(0);
  await expect(
    page.locator('#partner-virtual-soul .partner-card-links a'),
  ).toHaveCount(4);
  await page.goto('/info/mapa/?plano=bancos-rojos');
  for (const dark of [false, true]) {
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle('dark', dark),
      dark,
    );
    await expect(page.locator('.benches-aesit image')).toHaveCSS(
      'filter',
      'none',
    );
    await expect(page.locator('.student-amat image')).toHaveCSS(
      'filter',
      'none',
    );
    await expect(page.locator('[data-pingpong-logo]').first()).toHaveAttribute(
      'opacity',
      '1',
    );
    await expect(page.locator('.table-logo').first()).toHaveCSS(
      'mix-blend-mode',
      'normal',
    );
  }
  await expect(
    page.locator('#venue-telefonica-logo feColorMatrix'),
  ).toHaveAttribute('values', /0 0 0 0 \.4/);
});
