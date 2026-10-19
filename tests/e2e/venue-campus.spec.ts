import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/horarios/');
  await page.locator('[data-venue-building-select]').selectOption('principal');
});

test('La excavadora cubre las prefabricadas y se retira al pulsar o usar el teclado', async ({
  page,
}) => {
  const building = page.locator('[data-venue-building-select]');
  const gate = page.locator('[data-venue-unlock]');
  const map = page.locator('[data-venue-map]');
  for (const [index, id] of ['prefabricadas-a', 'prefabricadas-b'].entries()) {
    await building.selectOption(id);
    await expect(gate).toBeVisible();
    await expect(gate).toContainText('Tercer Edificio');
    await expect(page.locator('[data-venue-building]')).toHaveCSS(
      'filter',
      'blur(6px)',
    );
    await expect(
      page.getByRole('button', { name: 'Rotar plano', exact: true }),
    ).toBeDisabled();
    if (index === 0) {
      await gate.click();
    } else {
      await page.setViewportSize({ width: 390, height: 844 });
      await gate.focus();
      await page.keyboard.press('Enter');
    }
    await expect(gate).toBeHidden();
    await expect(map).toHaveAttribute('data-venue-locked', 'false');
    await expect(page.locator('[data-venue-building]')).toHaveCSS(
      'filter',
      'none',
    );
    await expect(
      page.getByRole('button', { name: 'Rotar plano', exact: true }),
    ).toBeEnabled();
    await page
      .getByRole('button', { name: 'Acercar plano', exact: true })
      .click();
    await expect(page.locator('[data-venue-zoom-value]')).toHaveText('150%');
  }
  await building.selectOption('prefabricadas-a');
  await expect(gate).toBeHidden();
});

test('La vista general permite abrir edificios y filtrar futbolín y ping pong en sus espacios exteriores', async ({
  page,
}) => {
  const building = page.locator('[data-venue-building-select]');
  const map = page.locator('[data-venue-map]');
  await building.selectOption('recinto');
  await expect(map).toHaveAttribute('data-venue-plan', 'recinto');
  await expect(map).toHaveAttribute('data-orientation', '2');
  await expect(page.locator('[data-venue-open-plan]:visible')).toHaveCount(7);
  await page
    .getByRole('button', { name: 'Abrir plano: Aulario', exact: true })
    .click();
  await expect(map).toHaveAttribute('data-venue-plan', 'aulario-0');
  for (const [zone, activity] of [
    ['bancos-rojos', 'Futbolín'],
    ['bajo-exterior', 'Ping Pong'],
  ]) {
    await building.selectOption('recinto');
    if (zone === 'bancos-rojos') {
      await page
        .getByRole('button', {
          name: 'Abrir plano: Bancos rojos · Futbolín',
          exact: true,
        })
        .locator('[data-venue-label]')
        .click();
      await expect(map).toHaveAttribute('data-venue-plan', 'bancos-rojos');
      await expect(
        page.locator('[data-venue-floor-plan="bancos-rojos"] .red-bench'),
      ).toHaveCount(3);
      await expect(
        page.locator('[data-venue-floor-plan="bancos-rojos"] .foosball'),
      ).toBeVisible();
    } else {
      await page
        .getByRole('button', {
          name: 'Abrir plano: Bajo exterior · Ping pong',
          exact: true,
        })
        .locator('[data-venue-label]')
        .click();
      await expect(map).toHaveAttribute('data-venue-plan', 'bajo-exterior');
      await expect(
        page.locator(
          '[data-venue-floor-plan="bajo-exterior"] [data-venue-ping-pong-table]',
        ),
      ).toHaveCount(1);
    }
    await page
      .locator(`[data-venue-zone="${zone}"] [data-venue-point]`)
      .click();
    const rows = page.locator('[data-program-row]:visible');
    expect(await rows.count()).toBeGreaterThan(0);
    for (const row of await rows.all())
      await expect(row).toContainText(activity, { ignoreCase: true });
    await page.getByRole('button', { name: 'Ver todas las zonas' }).click();
    await expect(rows).toHaveCount(46);
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('Los puntos informativos no alteran los filtros y el clic no enmarca todo el plano', async ({
  page,
}) => {
  const rows = page.locator('[data-program-row]:visible');
  for (const id of [
    'acceso-principal',
    'conserjeria',
    'secretaria',
    'streaming',
    'patio',
  ]) {
    await expect(page.locator(`[data-venue-zone="${id}"]`)).toBeVisible();
  }
  await page
    .locator('[data-venue-zone="secretaria"] [data-venue-point]')
    .click();
  await expect(rows).toHaveCount(46);
  await page
    .locator('[data-venue-zone="conserjeria"] [data-venue-point]')
    .click();
  await expect(rows).toHaveCount(46);
  await page
    .getByRole('button', { name: 'Cerrar información', exact: true })
    .click();
  await page.locator('[data-venue-zone="grados"] [data-venue-point]').click();
  await expect(rows).toHaveCount(2);
  await page
    .locator('[data-venue-zone="streaming"] [data-venue-point]')
    .click();
  await expect(rows).toHaveCount(2);
  await page.getByRole('button', { name: 'Ver todas las zonas' }).click();
  const drawing = page.locator('[data-venue-drawing]');
  await drawing.click({ position: { x: 20, y: 20 } });
  await expect(drawing).toHaveCSS('outline-style', 'none');
  await page
    .locator('[data-venue-floor-select]')
    .selectOption('principal-baja');
  await expect(
    page.locator('[data-venue-zone="terraza-cafeteria"]'),
  ).toBeVisible();
  await expect(page.locator('.cafe-round-table')).toHaveCount(5);
  await expect(page.locator('.terrace-table')).toHaveCount(6);
  await expect(page.locator('.cafe-bench')).toHaveCount(8);
  await expect(page.locator('[data-venue-zone="barra-cafeteria"]')).toHaveCount(
    0,
  );
  await expect(page.locator('[data-venue-map]')).not.toContainText(
    'Bajo cafetería',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const terrace = page.locator('[data-venue-zone="terraza-cafeteria"]');
  await terrace.locator('[data-venue-point]').click();
  await expect(terrace.locator('[data-venue-label]')).toBeVisible();
  await expect(rows).toHaveCount(46);
});

test('Los accesos de Vista General acercan la zona y permiten cancelar la transición cambiando de edificio', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const building = page.locator('[data-venue-building-select]');
  const map = page.locator('[data-venue-map]');
  await building.selectOption('recinto');
  await expect(building.locator('option:checked')).toHaveText('Vista General');
  await expect(page.locator('.campus-table')).toHaveCount(0);
  await page
    .locator('[data-venue-open-plan="principal-0"] [data-venue-point]')
    .click();
  await expect(map).toHaveAttribute('aria-busy', 'true');
  await expect(map).toHaveAttribute('data-venue-plan', 'principal-0');
  await expect(map).toHaveAttribute('aria-busy', 'false');
  await building.selectOption('recinto');
  await page
    .locator('[data-venue-open-plan="bancos-rojos"] [data-venue-point]')
    .click();
  await building.selectOption('aulario');
  await expect(map).toHaveAttribute('data-venue-plan', 'aulario-0');
  await expect(page.locator('[data-venue-drawing]')).toHaveCSS('opacity', '1');
  await page.setViewportSize({ width: 390, height: 844 });
  await building.selectOption('recinto');
  await page.locator('[data-venue-open-plan="bancos-rojos"]').focus();
  await page.keyboard.press('Enter');
  await expect(map).toHaveAttribute('data-venue-plan', 'bancos-rojos');
  await expect(
    page.locator('[data-venue-floor-plan="bancos-rojos"] .foosball'),
  ).toBeVisible();
});

test('Vista General distingue parking y aseos y el futbolín conserva las mesas alineadas', async ({
  page,
}) => {
  await page.locator('[data-venue-building-select]').selectOption('recinto');
  await expect(page.locator('[data-venue-zone="parking"]')).toBeVisible();
  await expect(page.locator('[data-campus-parking]')).toBeVisible();
  for (const id of ['a', 'b']) {
    const module = page.locator(`[data-campus-prefab="${id}"]`);
    await expect(module.locator('.campus-partition')).toHaveAttribute(
      'd',
      'M0 90H85M0 120H85M35 90V120M0 105H35',
    );
    await expect(module.locator('[data-venue-amenity="men"]')).toHaveCount(1);
    await expect(module.locator('[data-venue-amenity="women"]')).toHaveCount(1);
    await expect(module).not.toContainText('WC');
    await expect(module.locator('[data-campus-door]')).toHaveCount(5);
    await expect(
      module.locator('[data-campus-door="classroom-upper"] .plan-door'),
    ).toHaveAttribute('transform', 'translate(72 120) rotate(180)');
    await expect(
      module.locator('[data-campus-door="classroom-lower"] .plan-door'),
    ).toHaveAttribute('transform', 'translate(54 90) rotate(0)');
    await expect(
      module.locator('[data-campus-door="entrance"] .plan-door'),
    ).toHaveAttribute('transform', 'translate(85 96) rotate(90)');
    const icons = await module
      .locator('.venue-amenity-marker > circle')
      .evaluateAll((circles) =>
        circles.map((element) => {
          const circle = element as SVGCircleElement;
          const matrix = circle.getScreenCTM()!;
          return {
            x: matrix.e,
            y: matrix.f,
            radius: circle.r.baseVal.value * Math.hypot(matrix.a, matrix.b),
          };
        }),
      );
    expect(
      Math.hypot(icons[0].x - icons[1].x, icons[0].y - icons[1].y),
    ).toBeGreaterThan(icons[0].radius + icons[1].radius);
  }
  await page
    .locator('[data-venue-open-plan="bancos-rojos"] [data-venue-label]')
    .click();
  expect(
    await page
      .locator('[data-venue-floor-plan="bancos-rojos"] .foosball-row')
      .evaluateAll((rows) =>
        rows.map((row) => ({
          team: (row as SVGGElement).dataset.team,
          players: row.querySelectorAll('.foosball-player').length,
        })),
      ),
  ).toEqual([
    { team: 'red', players: 1 },
    { team: 'red', players: 3 },
    { team: 'white', players: 4 },
    { team: 'red', players: 3 },
    { team: 'white', players: 3 },
    { team: 'red', players: 4 },
    { team: 'white', players: 3 },
    { team: 'white', players: 1 },
  ]);
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-orientation',
    '3',
  );
  await page.getByRole('button', { name: 'Rotar plano', exact: true }).click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-orientation',
    '0',
  );
  const tables = page.locator(
    '[data-venue-floor-plan="bancos-rojos"] .red-table',
  );
  await expect(tables).toHaveCount(3);
  await expect(
    page.locator('[data-venue-floor-plan="bancos-rojos"] .red-seat'),
  ).toHaveCount(6);
  const positions = await tables.evaluateAll((elements) =>
    elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      return { top: bounds.top, bottom: bounds.bottom, left: bounds.left };
    }),
  );
  expect(
    Math.max(...positions.map((p) => p.top)) -
      Math.min(...positions.map((p) => p.top)),
  ).toBeLessThan(1);
  expect(positions[0].left).toBeLessThan(positions[1].left);
  expect(positions[1].left).toBeLessThan(positions[2].left);
  expect(Math.max(...positions.map((p) => p.bottom))).toBeLessThan(
    (await page
      .locator('[data-venue-floor-plan="bancos-rojos"] .foosball')
      .boundingBox())!.y,
  );
});

test('El parking queda separado de los edificios al girar y Mi agenda está después del plano', async ({
  page,
}) => {
  const map = page.locator('[data-venue-map]');
  expect(
    await map.evaluate((element) =>
      element.nextElementSibling?.matches('[data-personal-agenda]'),
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-venue-building-select]').selectOption('recinto');
  for (let turn = 0; turn < 4; turn++) {
    const overlap = await page
      .locator('.campus-parking-boundary')
      .evaluate((element) => {
        const parking = element as SVGPathElement;
        const toParking = parking.getScreenCTM()!.inverse();
        return [
          ...document.querySelectorAll('.campus-walls, .campus-prefab'),
        ].some((element) => {
          const shape = element as SVGGeometryElement;
          const matrix = toParking.multiply(shape.getScreenCTM()!);
          const length = shape.getTotalLength();
          for (let distance = 0; distance <= length; distance += 0.5) {
            const point = shape
              .getPointAtLength(distance)
              .matrixTransform(matrix);
            if (parking.isPointInFill(point)) return true;
          }
          return false;
        });
      });
    expect(overlap).toBe(false);
    const clipped = await page
      .locator('.campus-parking-boundary')
      .evaluate((element) => {
        const parking = element as SVGPathElement;
        const drawing = parking.ownerSVGElement!;
        const view = drawing.viewBox.baseVal;
        const matrix = drawing
          .getScreenCTM()!
          .inverse()
          .multiply(parking.getScreenCTM()!);
        for (
          let distance = 0;
          distance <= parking.getTotalLength();
          distance += 2
        ) {
          const point = parking
            .getPointAtLength(distance)
            .matrixTransform(matrix);
          if (
            point.x < view.x ||
            point.x > view.x + view.width ||
            point.y < view.y ||
            point.y > view.y + view.height
          )
            return true;
        }
        return false;
      });
    expect(clipped).toBe(false);
    await page
      .getByRole('button', { name: 'Rotar plano', exact: true })
      .click();
  }
  await page.locator('[data-venue-building-select]').selectOption('principal');
  await page
    .locator('[data-venue-floor-select]')
    .selectOption('principal-baja');
  await page
    .locator('[data-venue-zone="profesores-externos"] [data-venue-point]')
    .click();
  await expect(page.locator('[data-program-row]:visible')).toHaveCount(1);
  await expect(page.locator('[data-program-row]:visible')).toHaveAttribute(
    'data-location',
    'Sala de Profesores Externos.',
  );
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('.venue-canvas')).toHaveCSS(
    'background-color',
    'rgb(0, 68, 101)',
  );
  await expect(page.locator('.venue-canvas')).toHaveCSS(
    'border-top-left-radius',
    '20px',
  );
  await page.setViewportSize({ width: 320, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('Profesores Externos tiene la etiqueta encima y la puerta de las aulas inferiores aparece en la fachada inclinada', async ({
  page,
}) => {
  await page
    .locator('[data-venue-floor-select]')
    .selectOption('principal-baja');
  const zone = page.locator('[data-venue-zone="profesores-externos"]');
  const label = (await zone.locator('[data-venue-label]').boundingBox())!;
  const point = (await zone.locator('[data-venue-point]').boundingBox())!;
  expect(label.y + label.height).toBeLessThan(point.y);
  expect(
    Math.abs(label.x + label.width / 2 - point.x - point.width / 2),
  ).toBeLessThan(1);
  const door = page.locator('[data-principal-access="aulas-inferiores"]');
  await expect(door.locator('.door-leaf')).toBeVisible();
  await expect(door.locator('.door-swing')).toBeVisible();
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  const background = await page
    .locator('.venue-canvas')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(door.locator('.door-opening')).toHaveCSS('stroke', background);
});
