import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/horarios/');
  await page.locator('[data-venue-building-select]').selectOption('principal');
});

for (const width of [1440, 390]) {
  test(`Las salas se abren desde sus puntos y vuelven a su planta sin aparecer en los selectores a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const map = page.locator('[data-venue-map]');
    const floors = page.locator('[data-venue-floor-select]');
    for (const [parent, zone, detail, title] of [
      ['principal-0', 'hall', 'principal-hall', 'Hall principal'],
      ['principal-baja', 'actos', 'principal-actos', 'Salón de Actos'],
    ]) {
      await floors.selectOption(parent);
      await page.locator(`[data-venue-zone="${zone}"]`).focus();
      await page.keyboard.press('Enter');
      await expect(map).toHaveAttribute('data-venue-plan', detail);
      await expect(floors).toHaveValue(parent);
      await expect(floors.locator('option')).toHaveCount(2);
      await expect(
        page.locator(
          'select option[value="principal-hall"], select option[value="principal-actos"]',
        ),
      ).toHaveCount(0);
      await expect(page.locator('[data-venue-room-title]')).toHaveText(title);
      await expect(
        page.locator(`[data-venue-floor-plan="${detail}"]`),
      ).toBeVisible();
      await expect(
        page.locator(`[data-venue-floor-plan="${parent}"]`),
      ).toBeHidden();
      await expect(page.locator('[data-venue-floor-plan]:visible')).toHaveCount(
        1,
      );
      await expect(page.locator('[data-program-row]:visible')).toHaveCount(46);
      await page.locator('[data-venue-room-back]').click();
      await expect(map).toHaveAttribute('data-venue-plan', parent);
      await expect(page.locator('[data-venue-room-heading]')).toBeHidden();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test('Vista General amplía hasta el 600% con botones y rueda, y restaura el zoom al cambiar de plano', async ({
  page,
}) => {
  const building = page.locator('[data-venue-building-select]');
  const closer = page.getByRole('button', {
    name: 'Acercar plano',
    exact: true,
  });
  const value = page.locator('[data-venue-zoom-value]');
  await building.selectOption('recinto');
  for (let step = 0; step < 10; step++) await closer.click();
  await expect(value).toHaveText('600%');
  await expect(closer).toBeDisabled();
  await page
    .getByRole('button', { name: 'Restablecer zoom del plano' })
    .click();
  await expect(value).toHaveText('100%');
  await expect(closer).toBeEnabled();
  const drawing = page.locator('[data-venue-drawing]');
  await drawing.scrollIntoViewIfNeeded();
  const box = (await drawing.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -2000);
  await expect(value).toHaveText('600%');
  await building.selectOption('principal');
  await expect(value).toHaveText('100%');
  for (let step = 0; step < 3; step++) await closer.click();
  await expect(value).toHaveText('250%');
  await expect(closer).toBeDisabled();
});

test('Horarios abre Vista General por defecto en móvil y escritorio', async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/info/horarios/');
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-venue-plan',
      'recinto',
    );
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-orientation',
      '2',
    );
    await expect(page.locator('[data-venue-building-select]')).toHaveValue(
      'recinto',
    );
    await expect(page.locator('[data-venue-floor-select]')).toBeDisabled();
    await expect(
      page.locator('[data-venue-floor-plan="recinto"]'),
    ).toBeVisible();
    await expect(page.locator('[data-venue-floor-plan]:visible')).toHaveCount(
      1,
    );
  }
});

test.describe('Pasillo exterior con interacción táctil', () => {
  test.use({ hasTouch: true });
  test('Ping pong abre un pasillo con una sola mesa y permite volver a Vista General en móvil', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-venue-building-select]').selectOption('recinto');
    await page.locator('[data-venue-zone="campus-pingpong"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-venue-plan',
      'bajo-exterior',
    );
    const plan = page.locator('[data-venue-floor-plan="bajo-exterior"]');
    await expect(plan).toBeVisible();
    await expect(plan.locator('[data-venue-ping-pong-table]')).toHaveCount(1);
    await expect(plan.locator('[data-pingpong-logo]')).toBeVisible();
    await expect(plan.locator('[data-pingpong-logo]')).toHaveAttribute(
      'href',
      '/assets/venue/catedras-telefonica.png',
    );
    await page
      .locator('[data-venue-zone="bajo-exterior"] [data-venue-point]')
      .tap();
    await expect(page.locator('[data-program-row]:visible')).toHaveCount(1);
    await expect(page.locator('[data-program-row]:visible')).toContainText(
      'Ping Pong',
    );
    await page.getByRole('button', { name: 'Ver todas las zonas' }).click();
    await expect(plan).toBeVisible();
    await page.getByRole('button', { name: 'Volver a Vista General' }).click();
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-venue-plan',
      'recinto',
    );
  });
});
