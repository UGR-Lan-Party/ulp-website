import { test, expect } from '@playwright/test';

test('Los logos de entidades cargan con sus variantes de tema y se puede ir del colaborador al concierto y volver', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.goto('/participan/');
  const logos = page.locator('[data-partner-card] [data-partner-logo]');
  expect(await logos.count()).toBe(37);
  for (const logo of await logos.all()) {
    await logo.scrollIntoViewIfNeeded();
    await logo.evaluate(async (node: HTMLImageElement) => node.decode());
    expect(await logo.getAttribute('src')).toContain('/normalized/');
  }
  const partner = page.locator('#partner-virtual-soul');
  await partner.scrollIntoViewIfNeeded();
  await partner.screenshot({ path: testInfo.outputPath('partner-light.png') });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(partner.locator('[data-partner-logo]')).toBeVisible();
  await expect(partner.locator('[data-partner-white-logo]')).toBeHidden();
  await partner.screenshot({ path: testInfo.outputPath('partner-dark.png') });
  await expect(partner.locator('.partner-activities')).toHaveCount(0);
  await page.goto('/actividades/concierto/');
  await expect(page).toHaveURL(/actividades\/concierto/);
  await page.locator('.concert-orchestra a').click();
  await expect(page).toHaveURL(/participan\/#partner-virtual-soul/);
  await expect(page.locator('#partner-virtual-soul')).toBeInViewport();
  await page.goto('/info/about/');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  const white = page.locator(
    '.about-partners [data-partner-white-logo="Virtual Soul"]',
  );
  await white.scrollIntoViewIfNeeded();
  await expect(white).toBeVisible();
  await expect(
    page.locator('.about-partners [data-partner-logo="Virtual Soul"]'),
  ).toBeHidden();
});

for (const width of [320, 390, 768, 1440]) {
  test(`Home y catálogo mantienen el ancho y el contenido a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://**', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );
    await page.goto('/');
    for (const dark of [false, true]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle('dark', dark),
        dark,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto('/actividades/');
    const cards = page.locator('.activity-tile');
    expect(await cards.count()).toBeGreaterThan(20);
    for (const card of await cards.all()) {
      expect(
        await card.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const concert = page.locator(
      '.activity-tile[href="/actividades/concierto"]',
    );
    await concert.scrollIntoViewIfNeeded();
    await concert.screenshot({
      path: testInfo.outputPath(`catalog-${width}.png`),
    });
  });
}

test('La ruta al aulario anticipa los tramos y anuncia el cambio de planta', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/horarios/');
  await page.locator('[data-route-panel] summary').click();
  await page.locator('[data-route-destination]').selectOption('aulario-1.2');
  await page
    .locator('[data-route-form]')
    .evaluate((el: HTMLFormElement) => el.requestSubmit());
  await expect(page.locator('[data-route-upcoming]')).toBeVisible();
  await expect(
    page.locator('[data-route-steps] button[data-upcoming]'),
  ).toHaveCount(1);
  await page.locator('[data-route-next]').click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'recinto',
  );
  await page.locator('[data-route-next]').click();
  await expect(page.locator('[data-route-upcoming-title]')).toContainText(
    'Planta 1',
  );
  await expect(page.locator('[data-route-instruction]')).toContainText(
    'Sube por las escaleras',
  );
  await page
    .locator('[data-route-result]')
    .screenshot({ path: testInfo.outputPath('route-upcoming.png') });
  await page.locator('[data-route-next]').click();
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'aulario-1',
  );
  await expect(page.locator('[data-route-upcoming]')).toBeHidden();
  await expect(page.locator('[data-route-instruction]')).toContainText(
    'Llegada',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
