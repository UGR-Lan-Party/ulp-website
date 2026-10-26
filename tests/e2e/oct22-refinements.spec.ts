import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('new campus and Legacy switch, routes and agenda order remain usable', async ({
  page,
}, testInfo) => {
  await page.goto('/info/horarios');
  const map = page.locator('[data-venue-map]');
  await expect(map).toHaveAttribute('data-campus-version', 'legacy');
  await expect(
    page.getByRole('radio', { name: 'Vista General (Legacy)', exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole('button', { name: 'Información de Parking', exact: true }),
  ).toBeVisible();
  const legacyPerimeter = page.locator(
    'g[data-campus-version="legacy"] [data-campus-perimeter]',
  );
  await expect(legacyPerimeter).toBeVisible();
  const perimeter = await legacyPerimeter.getAttribute('d');
  const legacyWater = page.locator(
    'g[data-campus-version="legacy"] [data-campus-courtyard-fountain]',
  );
  await expect(legacyWater).toHaveCSS('fill', 'rgb(212, 226, 229)');
  const legacyWaterPath = await legacyWater.getAttribute('d');
  const legacySitePath = await page
    .locator('g[data-campus-version="legacy"] [data-campus-site-details]')
    .getAttribute('d');

  const legacyWing = page.locator(
    'g[data-campus-version="legacy"] [data-campus-principal-wing]',
  );
  await expect(legacyWing).toBeVisible();
  const wingGeometry = await legacyWing
    .locator('path')
    .first()
    .getAttribute('d');
  for (const id of ['a', 'b']) {
    await expect(
      page.locator(
        `[data-campus-prefab="${id}"] [data-prefab-structural-columns] rect`,
      ),
    ).toHaveCount(8);
  }

  const legacyTransform = await legacyPerimeter.getAttribute('transform');
  const parkingGeometry = await page
    .locator('g[data-campus-version="legacy"] .campus-parking-boundary')
    .evaluate((element) => {
      const parking = element as SVGGeometryElement;
      const inverse = parking.getCTM()!.inverse();
      const values = parking
        .getAttribute('d')!
        .match(/-?\d+(?:\.\d+)?/g)!
        .map(Number);
      const a = { x: values[0], y: values[1] },
        b = { x: values[5], y: values[4] };
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const prefabs = [
        ...document.querySelectorAll(
          'g[data-campus-version="legacy"] .campus-prefab',
        ),
      ] as SVGGeometryElement[];
      const alignment = prefabs.flatMap((prefab) => {
        const matrix = inverse.multiply(prefab.getCTM()!);
        return [new DOMPoint(0, 0), new DOMPoint(0, 210)].map((local) => {
          const point = local.matrixTransform(matrix);
          return Math.abs(
            ((b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)) /
              length,
          );
        });
      });
      const shapes = [
        ...prefabs,
        ...document.querySelectorAll(
          'g[data-campus-version="legacy"] .campus-walls',
        ),
      ] as SVGGeometryElement[];
      const overlap = shapes.some((shape) => {
        const matrix = inverse.multiply(shape.getCTM()!);
        const length = shape.getTotalLength();
        for (let distance = 0; distance <= length; distance += 1) {
          if (
            parking.isPointInFill(
              shape.getPointAtLength(distance).matrixTransform(matrix),
            )
          )
            return true;
        }
        return false;
      });
      const border = document.querySelector(
        'g[data-campus-version="legacy"] [data-campus-perimeter]',
      ) as SVGGeometryElement;
      const enclosed = shapes.every((shape) => {
        const matrix = border.getCTM()!.inverse().multiply(shape.getCTM()!);
        const length = shape.getTotalLength();
        for (let distance = 0; distance <= length; distance += 5) {
          if (
            !border.isPointInFill(
              shape.getPointAtLength(distance).matrixTransform(matrix),
            )
          )
            return false;
        }
        return true;
      });
      return { alignment, overlap, enclosed };
    });
  parkingGeometry.alignment.forEach((distance) =>
    expect(distance).toBeLessThan(0.01),
  );
  expect(parkingGeometry.overlap).toBe(false);
  expect(parkingGeometry.enclosed).toBe(true);

  const existingBuildings = await page
    .locator('g[data-campus-version="legacy"] [data-campus-existing-buildings]')
    .getAttribute('d');
  await expect(
    page.locator(
      'g[data-campus-version="modern"] [data-campus-existing-buildings]',
    ),
  ).toHaveAttribute('d', existingBuildings!);
  const existingMarkers = await page
    .locator(
      '[data-venue-zone="campus-principal"] [data-venue-point], [data-venue-zone="campus-aulario"] [data-venue-point]',
    )
    .evaluateAll((points) =>
      points.map((point) => [
        point.getAttribute('cx'),
        point.getAttribute('cy'),
      ]),
    );
  await expect(page.locator('[data-campus-amphitheater]')).toHaveCSS(
    'fill',
    'rgb(220, 233, 207)',
  );
  expect(
    await page.locator('[data-campus-amphitheater]').evaluate((path) => {
      const shape = path as SVGGeometryElement;
      return [
        [500, 347],
        [602, 348],
        [508, 285],
        [612, 348],
      ].map(([x, y]) => shape.isPointInFill(new DOMPoint(x, y)));
    }),
  ).toEqual([true, true, false, false]);
  await page
    .locator('.venue-canvas')
    .screenshot({ path: testInfo.outputPath('campus-legacy.png') });
  await page.getByRole('radio', { name: 'Vista General', exact: true }).check();
  await expect(map).toHaveAttribute('data-venue-locked', 'true');
  await expect(page.locator('[data-venue-unlock]')).toBeVisible();
  await page.locator('[data-venue-unlock]').click();
  await expect(map).toHaveAttribute('data-venue-locked', 'false');
  await expect(
    page.locator('[data-campus-version="modern"] [data-campus-new-building]'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Información de Parking', exact: true }),
  ).toBeHidden();
  await expect(page.locator('[data-modern-principal-wing]')).toBeVisible();
  await expect(
    page.locator('[data-modern-principal-wing] path').first(),
  ).toHaveAttribute('d', wingGeometry!);
  const modernPerimeter = page.locator(
    'g[data-campus-version="modern"] [data-campus-perimeter]',
  );
  await expect(modernPerimeter).toBeVisible();
  await expect(modernPerimeter).toHaveAttribute('d', perimeter!);
  await expect(modernPerimeter).not.toHaveAttribute(
    'transform',
    legacyTransform!,
  );
  expect(
    await page.locator('[data-campus-new-building]').evaluate((building) => {
      const outline = building as SVGGeometryElement;
      const perimeter = document.querySelector(
        'g[data-campus-version="modern"] [data-campus-perimeter]',
      ) as SVGGeometryElement;
      const toPerimeter = perimeter
        .getCTM()!
        .inverse()
        .multiply(outline.getCTM()!);
      return [
        [676, 804],
        [756, 804],
        [784, 644],
        [784, 432],
        [527, 188],
      ].map(([x, y]) =>
        perimeter.isPointInFill(
          new DOMPoint(x, y).matrixTransform(toPerimeter),
        ),
      );
    }),
  ).toEqual([true, true, true, true, true]);

  expect(
    await page.locator('[data-modern-structural-columns] rect').count(),
  ).toBeGreaterThan(30);

  await expect(page.locator('[data-campus-new-building]')).toHaveCSS(
    'stroke',
    'none',
  );
  expect(
    await page
      .locator('[data-modern-building-outline]')
      .evaluate((path) =>
        (path as SVGGeometryElement).isPointInStroke(new DOMPoint(527, 225)),
      ),
  ).toBe(false);

  expect(
    await page
      .locator(
        '[data-venue-zone="campus-principal"] [data-venue-point], [data-venue-zone="campus-aulario"] [data-venue-point]',
      )
      .evaluateAll((points) =>
        points.map((point) => [
          point.getAttribute('cx'),
          point.getAttribute('cy'),
        ]),
      ),
  ).toEqual(existingMarkers);
  await expect(page.locator('[data-modern-courtyard]')).toHaveCSS(
    'fill',
    'rgb(220, 233, 207)',
  );

  await expect(page.locator('[data-modern-patio-fountain]')).toHaveAttribute(
    'd',
    legacyWaterPath!,
  );
  await expect(page.locator('[data-modern-patio-fountain]')).toHaveCSS(
    'fill',
    'rgb(212, 226, 229)',
  );
  await expect(
    page.locator('g[data-campus-version="modern"] [data-campus-site-details]'),
  ).toHaveAttribute('d', legacySitePath!);
  expect(
    await page.locator('#campus-retained-site path').evaluate((element) => {
      const clip = element as SVGGeometryElement;
      return [
        [510, 282],
        [500, 305],
        [500, 390],
        [489, 412],
        [510, 430],
        [545, 350],
      ].map(([x, y]) => clip.isPointInFill(new DOMPoint(x, y)));
    }),
  ).toEqual([true, true, true, true, true, false]);
  const patio = await page
    .locator('[data-modern-courtyard]')
    .evaluate((element) => {
      const garden = element as SVGGeometryElement;
      const gardenClip = document.querySelector(
        '#modern-courtyard-unpaved path',
      ) as SVGGeometryElement;
      const fountain = document.querySelector(
        '[data-modern-patio-fountain]',
      ) as SVGGeometryElement;
      const paving = document.querySelector(
        '[data-modern-patio-promenade]',
      ) as SVGGeometryElement;
      const inside = (shape: SVGGeometryElement, x: number, y: number) =>
        shape.isPointInFill(new DOMPoint(x, y));
      return {
        garden: [
          [510, 350],
          [540, 350],
          [505, 420],
          [530, 420],
        ].map(([x, y]) => inside(garden, x, y) && inside(gardenClip, x, y)),
        paving: [
          [510, 350],
          [512, 305],
          [510, 390],
          [500, 400],
        ].map(([x, y]) => inside(paving, x, y)),
        water: [
          [505, 420],
          [489, 412],
          [484, 412],
          [518, 440],
          [500, 430],
        ].map(([x, y]) => inside(fountain, x, y)),
      };
    });
  expect(patio.garden).toEqual([false, true, false, true]);
  expect(patio.paving).toEqual([true, true, true, true]);
  expect(patio.water).toEqual([true, true, false, false, true]);

  await expect(
    page.locator(
      'g[data-campus-version="modern"] [data-campus-parking], g[data-campus-version="modern"] [data-campus-prefab]',
    ),
  ).toHaveCount(0);
  await page
    .locator('.venue-canvas')
    .screenshot({ path: testInfo.outputPath('campus-modern.png') });
  await page
    .getByRole('button', { name: 'Acercar plano', exact: true })
    .click();
  await page
    .locator('.venue-canvas')
    .screenshot({ path: testInfo.outputPath('campus-modern-zoom.png') });
  for (let i = 0; i < 2; i++)
    await page
      .getByRole('button', { name: 'Acercar plano', exact: true })
      .click();
  const jointClip = await page
    .locator('[data-modern-courtyard]')
    .evaluate((element) => {
      const matrix = (element as SVGGeometryElement).getScreenCTM()!;
      const a = new DOMPoint(477, 280).matrixTransform(matrix);
      const b = new DOMPoint(541, 445).matrixTransform(matrix);
      return {
        x: Math.min(a.x, b.x) + window.scrollX,
        y: Math.min(a.y, b.y) + window.scrollY,
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
      };
    });
  await page.screenshot({
    path: testInfo.outputPath('patio-strip-detail.png'),
    fullPage: true,
    clip: jointClip,
  });

  await page
    .getByRole('button', { name: 'Restablecer zoom del plano', exact: true })
    .click();
  for (let i = 0; i < 4; i++) {
    await page
      .getByRole('button', { name: 'Rotar plano', exact: true })
      .click();
    const viewport = await page.locator('[data-venue-drawing]').boundingBox();
    const enclosure = await modernPerimeter.boundingBox();
    expect(enclosure!.x).toBeGreaterThanOrEqual(viewport!.x);
    expect(enclosure!.y).toBeGreaterThanOrEqual(viewport!.y);
    expect(enclosure!.x + enclosure!.width).toBeLessThanOrEqual(
      viewport!.x + viewport!.width,
    );
    expect(enclosure!.y + enclosure!.height).toBeLessThanOrEqual(
      viewport!.y + viewport!.height,
    );
  }
  await page
    .getByRole('radio', { name: 'Vista General (Legacy)', exact: true })
    .check();
  await page.getByRole('radio', { name: 'Vista General', exact: true }).check();
  await expect(page.locator('[data-venue-unlock]')).toBeHidden();
  await page.locator('[data-route-panel] > summary').click();
  await page
    .getByRole('button', { name: 'Ver recorrido', exact: false })
    .click();
  await expect(map).toHaveAttribute('data-campus-version', 'legacy');
  const order = await page.locator('[data-program]').evaluate((root) => {
    const y = (q: string) => root.querySelector(q)!.getBoundingClientRect().top;
    return [
      y('[data-venue-map]'),
      y('#mi-agenda'),
      y('.program-header'),
      y('.program-filters'),
      y('[data-program-table]'),
    ];
  });
  expect(order).toEqual([...order].sort((a, b) => a - b));
});
test('awards list is revealed independently with keyboard', async ({
  page,
}) => {
  await page.goto('/actividades/league-of-legends');
  const card = page.locator('[data-award-reveal]').first();
  const button = card.locator('[data-award-show]');
  await expect(card).toHaveAttribute('data-concealed', 'true');
  await button.focus();
  await button.press('Enter');
  await expect(button).toBeHidden();
  await expect(card.locator('[data-award-list]')).not.toHaveAttribute(
    'aria-hidden',
  );
});
test('survey menus use rounded popup and keyboard selection', async ({
  page,
}) => {
  await page.goto('/info/ediciones_anteriores');
  const control = page.locator('.survey-select-button').nth(1);
  const arrow = control.locator('.survey-select-arrow svg');
  const geometry = await control.evaluate((button) => {
    const box = button.getBoundingClientRect();
    const arrow = button
      .querySelector('.survey-select-arrow')!
      .getBoundingClientRect();
    const svg = button.querySelector('svg')!.getBoundingClientRect();
    return {
      gap: box.right - arrow.right,
      center: Math.abs(svg.top + svg.height / 2 - (box.top + box.height / 2)),
      separator: getComputedStyle(button.querySelector('.survey-select-arrow')!)
        .borderLeftWidth,
    };
  });
  await expect(arrow).toBeVisible();
  expect(geometry.gap).toBeLessThan(2);
  expect(geometry.center).toBeLessThan(1);
  expect(geometry.separator).toBe('1px');
  await control.click();
  const option = page.getByRole('option', {
    name: 'Número de votos',
    exact: true,
  });
  await expect(option).toBeVisible();
  await option.press('Home');
  await page
    .getByRole('option', { name: 'Porcentaje de respuestas', exact: true })
    .press('Enter');
  await expect(page.locator('[data-survey-comparison]')).toHaveAttribute(
    'data-display',
    'percent',
  );
  await expect(page.locator('.survey-select-menu:visible')).toHaveCount(0);
});
for (const width of [390, 1440])
  test(`hidden countdown and compact partners are responsive at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await expect(page.locator('[data-event-countdown]')).toHaveCount(0);
    await expect(page.locator('.partner-year').first()).toHaveText('2026');
    await expect(page.locator('.footer-credit')).toHaveText(
      `2016 — ${new Date().getFullYear()} @ Universidad de Granada`,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
