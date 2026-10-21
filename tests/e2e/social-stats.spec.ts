import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('Social counters refresh without rewriting history and keep honest partial/stale labels', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/social-stats', (route) => {
    calls++;
    return route.fulfill({
      json: {
        version: 1,
        networks: [
          'x',
          'instagram',
          'discord',
          'twitch',
          'tiktok',
          'youtube',
          'facebook',
        ].map((id, index) => ({
          id,
          count: 100 + index + calls,
          updatedAt: new Date().toISOString(),
          status: calls === 3 ? 'stale' : 'ok',
          approximate: id === 'discord',
        })),
      },
    });
  });
  await page.goto('/info/rrss/');
  await expect(page.locator('.linktree-card')).toHaveAttribute(
    'href',
    'https://linktr.ee/ulpugr',
  );
  await expect(page.locator('[data-social-status]')).toHaveText(
    'Actualizado · revisión cada minuto',
  );
  await expect(page.locator('thead th')).toHaveText([
    'Ed. 2022',
    'Ed. 2023',
    'Ed. 2024',
    'Ed. 2025',
    'Ed. 2026',
    /Actual/,
    'Red social / edición',
  ]);
  await expect(
    page.getByText('Estamos al otro lado', { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('#social-table-note')).toHaveCount(0);
  await expect(
    page.locator('[data-social-network="discord"] [data-social-current]'),
  ).toHaveText('103');
  const heights = await page
    .locator('tbody tr')
    .evaluateAll((rows) =>
      rows.map((row) => row.getBoundingClientRect().height),
    );
  expect(Math.max(...heights)).toBeLessThan(70);
  const x = page.locator('[data-social-network="x"]');
  await expect(x.locator('[data-social-current]')).toHaveText('101');
  await expect(x.locator('[data-edition="2026"]')).toHaveText('813');
  await page.locator('[data-social-refresh]').click();
  await expect(x.locator('[data-social-current]')).toHaveText('102');
  await page.locator('[data-social-refresh]').click();
  await expect(x.locator('[data-social-info]')).toHaveText(
    'Último dato disponible',
  );
  await expect(x.locator('[data-edition="2026"]')).toHaveText('813');
  await expect(page.locator('[data-edition-total="2026"]')).toHaveText(
    /2\.?890/,
  );
  await expect(page.locator('[data-edition-total="2022"]')).toHaveText(
    /1\.?028/,
  );
  await expect(
    page.locator('tbody a[target="_blank"][rel="noopener noreferrer"]'),
  ).toHaveCount(7);
  await page.route('**/api/social-stats', (route) => route.abort());
  await page.locator('[data-social-refresh]').click();
  await expect(page.locator('[data-social-status]')).toContainText(
    'Sin conexión',
  );
  await expect(x.locator('[data-social-current]')).toHaveText('103');
});

for (const width of [1440, 390])
  test(`The table scrolls within the page and remains readable in both themes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.route('**/api/social-stats', (route) =>
      route.fulfill({
        json: {
          version: 1,
          networks: [
            'x',
            'instagram',
            'discord',
            'twitch',
            'tiktok',
            'youtube',
            'facebook',
          ].map((id) => ({
            id,
            count: id === 'discord' ? 350 : null,
            updatedAt: id === 'discord' ? new Date().toISOString() : null,
            status: id === 'discord' ? 'ok' : 'unconfigured',
            approximate: id === 'discord',
          })),
        },
      }),
    );
    await page.goto('/info/rrss/');
    await expect(page.locator('[data-social-status]')).toHaveText(
      '1 de 7 redes actualizadas',
    );
    await expect(
      page.locator('[data-social-network="discord"] [data-social-current]'),
    ).toHaveText('350');
    await expect(page.locator('[data-social-total]')).toHaveText('350');
    await expect(page.locator('[data-social-total-note]')).toHaveText(
      'Parcial · 1 de 7 redes',
    );
    await expect(
      page.locator('[data-social-network="instagram"] [data-social-info]'),
    ).toHaveText('Pendiente de conexión');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole('button', { name: 'Modo oscuro', exact: true })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 390) {
      expect(
        await page
          .locator('.social-table-scroll')
          .evaluate((el) => el.scrollLeft),
      ).toBeGreaterThan(0);
    }
    if (width === 390)
      await page
        .getByRole('button', { name: 'Menú principal', exact: true })
        .click();
    await page
      .getByRole('button', { name: 'Información', exact: true })
      .click();
    await expect(
      page
        .locator('.submenu')
        .getByRole('link', { name: 'Redes sociales', exact: true }),
    ).toBeVisible();
  });

test('The open page refreshes every minute and pauses while hidden', async ({
  page,
}) => {
  await page.clock.install();
  let calls = 0;
  await page.route('**/api/social-stats', (route) => {
    calls++;
    return route.fulfill({
      json: {
        version: 1,
        networks: [
          'x',
          'instagram',
          'discord',
          'twitch',
          'tiktok',
          'youtube',
          'facebook',
        ].map((id) => ({
          id,
          count: calls,
          updatedAt: new Date().toISOString(),
          status: 'ok',
        })),
      },
    });
  });
  await page.goto('/info/rrss/');
  const value = page.locator('[data-social-network="x"] [data-social-current]');
  await expect(value).toHaveText('1');
  await page.clock.fastForward(60_001);
  await expect(value).toHaveText('2');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(120_001);
  expect(calls).toBe(2);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(value).toHaveText('3');
});
