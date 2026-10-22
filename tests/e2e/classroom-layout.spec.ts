import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (r) =>
    r.fulfill({
      status: 200,
      body: '',
      contentType:
        r.request().resourceType() === 'script'
          ? 'application/javascript'
          : 'text/html',
    }),
  );
});
test('Las aulas están separadas y sus líneas discontinuas no atraviesan el mobiliario', async ({
  page,
}) => {
  await page.goto('/info/horarios/?plano=aulas-inferiores#plano');
  const plan = page.locator('[data-venue-floor-plan="aulas-inferiores"]');
  await expect(plan).not.toHaveAttribute('data-hidden');
  const frames = await plan
    .locator('[data-lower-room]')
    .evaluateAll((nodes) =>
      nodes
        .map((node) => (node as SVGGraphicsElement).getBBox())
        .map(({ x, y, width, height }) => ({ x, y, width, height })),
    );
  expect(frames[1].x - frames[0].x - frames[0].width).toBeGreaterThan(80);
  const collisions = await plan.evaluate((node) => {
    const frames = Array.from(node.querySelectorAll('[data-lower-room]')).map(
      (x) => (x as SVGGraphicsElement).getBBox(),
    );
    return Array.from(node.querySelectorAll('[data-venue-fixture]')).filter(
      (fixture) => {
        const b = (fixture as SVGGraphicsElement).getBBox();
        return !frames.some(
          (f) =>
            b.x > f.x + 8 &&
            b.y > f.y + 8 &&
            b.x + b.width < f.x + f.width - 8 &&
            b.y + b.height < f.y + f.height - 8,
        );
      },
    ).length;
  });
  expect(collisions).toBe(0);
  await expect(plan.locator('[data-venue-amenity="entry"]')).toHaveCount(2);
});

test('Los rótulos de aulas evitan mesas y sillas en los cuatro giros', async ({
  page,
}) => {
  await page.goto('/info/horarios/?plano=aulas-inferiores#plano');
  for (let turn = 0; turn < 4; turn++) {
    await expect(page.locator('[data-venue-map]')).toHaveAttribute(
      'data-orientation',
      String(turn),
    );
    const collisions = await page
      .locator('[data-venue-map]')
      .evaluate((root) => {
        const fixtures = Array.from(
          root.querySelectorAll(
            '[data-venue-floor-plan="aulas-inferiores"] [data-venue-fixture]',
          ),
        ).map((element) => {
          const box = (element as SVGGraphicsElement).getBBox(),
            matrix = (element as SVGGraphicsElement).getScreenCTM()!;
          const points = [
            new DOMPoint(box.x, box.y),
            new DOMPoint(box.x + box.width, box.y + box.height),
          ].map((point) => point.matrixTransform(matrix));
          return {
            left: Math.min(points[0].x, points[1].x),
            right: Math.max(points[0].x, points[1].x),
            top: Math.min(points[0].y, points[1].y),
            bottom: Math.max(points[0].y, points[1].y),
          };
        });
        let total = 0;
        for (const element of root.querySelectorAll(
          '[data-venue-zone="aula11"] [data-venue-leader],[data-venue-zone="aula12"] [data-venue-leader]',
        )) {
          const path = element as SVGPathElement;
          const matrix = path.getScreenCTM()!;
          for (
            let position = 0;
            position < path.getTotalLength();
            position += 1
          ) {
            const pt = path.getPointAtLength(position).matrixTransform(matrix);
            if (
              fixtures.some(
                (box) =>
                  pt.x > box.left + 0.5 &&
                  pt.x < box.right - 0.5 &&
                  pt.y > box.top + 0.5 &&
                  pt.y < box.bottom - 0.5,
              )
            )
              total++;
          }
        }
        return total;
      });
    expect(collisions).toBe(0);
    if (turn < 3)
      await page
        .getByRole('button', { name: 'Rotar plano', exact: true })
        .click();
  }
});
