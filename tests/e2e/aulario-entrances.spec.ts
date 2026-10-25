import { test, expect } from '@playwright/test';
test('The route to Aula 1.2 goes through the main entrance and both entrance callouts are visible', async ({
  page,
}) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/mapa/');
  await page.locator('[data-route-panel] summary').click();
  await page.locator('[data-route-destination]').selectOption('aulario-1.2');
  await page
    .locator('[data-route-form]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator('[data-route-steps] button')).toHaveCount(4);
  await page.locator('[data-route-next]').click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'recinto',
  );
  await expect(page.locator('[data-route-instruction]')).toHaveText(
    'Entrada principal del Aulario',
  );
  await expect(
    page.locator('[data-venue-floor-plan="pasillo-exterior"]'),
  ).toHaveCount(0);
  const crossesTable = await page
    .locator('[data-route-layer] path')
    .last()
    .evaluate((element) => {
      const route = element as SVGPathElement;
      const table = document.querySelector(
        '[data-venue-floor-plan="recinto"] .table-frame',
      ) as SVGGeometryElement;
      const matrix = table
        .getScreenCTM()!
        .inverse()
        .multiply(route.getScreenCTM()!);
      for (let d = 0; d <= route.getTotalLength(); d += 0.5)
        if (
          table.isPointInFill(route.getPointAtLength(d).matrixTransform(matrix))
        )
          return true;
      return false;
    });
  expect(crossesTable).toBe(false);
  await page.locator('[data-route-next]').click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'aulario-0',
  );
  const main = page.locator('[data-venue-zone="aulario-entry"]'),
    aux = page.locator('[data-venue-zone="aulario-aux-entry"]');
  await expect(main).toBeVisible();
  await expect(aux).toBeVisible();
  await expect(main).toContainText('Entrada principal');
  await expect(aux).toContainText('Entrada auxiliar');
  const mainPoint = (await main.locator('[data-venue-point]').boundingBox())!,
    auxPoint = (await aux.locator('[data-venue-point]').boundingBox())!;
  expect(mainPoint.x).toBeGreaterThan(auxPoint.x);
  for (const [zone, point] of [
    [main, mainPoint],
    [aux, auxPoint],
  ] as const) {
    const label = (await zone.locator('[data-venue-label]').boundingBox())!;
    expect(label.y).toBeGreaterThan(point.y + point.height);
  }
  await page.locator('[data-route-next]').click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'aulario-1',
  );
  await expect(page.locator('[data-route-instruction]')).toContainText(
    'escaleras',
  );
  await expect(page.locator('[data-route-instruction]')).toContainText(
    'Aula 1.2',
  );
});
