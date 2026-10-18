import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.goto('/info/horarios/');
});

for (const width of [1400, 390]) {
  test(`B1 gira alrededor del centro del aula sin desplazarse a ${width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 900 });
    await page
      .locator('[data-venue-building-select]')
      .selectOption('prefabricadas-b');
    const room = page.locator(
      '[data-venue-floor-plan="prefabricadas-b"] .floor-room',
    );
    const map = page.locator('[data-venue-map]');
    await room.scrollIntoViewIfNeeded();
    const center = await room.evaluate((element: SVGGraphicsElement) => {
      const bounds = element.getBBox();
      const point = new DOMPoint(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      ).matrixTransform(element.getCTM()!);
      return { x: point.x, y: point.y };
    });
    for (let turn = 0; turn < 4; turn++) {
      await page
        .getByRole('button', { name: 'Rotar plano', exact: true })
        .click();
      const drift = await room.evaluate(async (element: SVGGraphicsElement) => {
        const bounds = element.getBBox();
        const points: { x: number; y: number }[] = [];
        for (let frame = 0; frame < 24; frame++) {
          await new Promise(requestAnimationFrame);
          const point = new DOMPoint(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
          ).matrixTransform(element.getCTM()!);
          points.push({ x: point.x, y: point.y });
        }
        return points;
      });
      for (const point of drift)
        expect(Math.hypot(point.x - center.x, point.y - center.y)).toBeLessThan(
          1,
        );
      await expect(map).toHaveAttribute('aria-busy', 'false');
      const distance = await room.evaluate((element: SVGGraphicsElement) => {
        const bounds = element.getBBox();
        const center = new DOMPoint(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        ).matrixTransform(element.getCTM()!);
        const marker = document.querySelector<SVGCircleElement>(
          '[data-venue-zone="b1"] [data-venue-point]',
        )!;
        const anchor = new DOMPoint(
          marker.cx.baseVal.value,
          marker.cy.baseVal.value,
        ).matrixTransform(marker.getCTM()!);
        return Math.hypot(center.x - anchor.x, center.y - anchor.y);
      });
      expect(distance).toBeLessThan(1);
    }
  });
}

test('El Aulario abre con las dos vistas invertidas, mantiene rótulos derechos y Home restaura la vista inicial', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const map = page.locator('[data-venue-map]');
  const building = page.locator('[data-venue-building-select]');
  const floor = page.locator('[data-venue-floor-select]');
  await building.selectOption('aulario');
  await expect(map).toHaveAttribute('data-orientation', '1');
  const outline = (await page
    .locator('[data-venue-floor-plan="aulario-0"] .aulario-perimeter')
    .boundingBox())!;
  expect(outline.width).toBeGreaterThan(outline.height * 2);
  expect(
    await page
      .locator('[data-aulario-room="0.2"] text')
      .evaluate((element: SVGGraphicsElement) => {
        const matrix = element.getCTM()!;
        return (
          matrix.a > 0 &&
          matrix.d > 0 &&
          Math.abs(matrix.b) < 0.0001 &&
          Math.abs(matrix.c) < 0.0001
        );
      }),
  ).toBe(true);
  await page.getByRole('button', { name: 'Rotar plano', exact: true }).click();
  await expect(map).toHaveAttribute('data-orientation', '2');
  await page.locator('[data-venue-drawing]').focus();
  await page.keyboard.press('Home');
  await expect(map).toHaveAttribute('data-orientation', '1');
  await floor.selectOption('aulario-1');
  await expect(map).toHaveAttribute('data-orientation', '2');
  const firstFloorLabel = page.locator('[data-aulario-room="1.2"] text');
  expect(
    await firstFloorLabel.evaluate((element: SVGGraphicsElement) => {
      const matrix = element.getCTM()!;
      return (
        matrix.a > 0 &&
        matrix.d > 0 &&
        Math.abs(matrix.b) < 0.0001 &&
        Math.abs(matrix.c) < 0.0001
      );
    }),
  ).toBe(true);
  await floor.selectOption('aulario-0');
  await expect(map).toHaveAttribute('data-orientation', '1');
});
