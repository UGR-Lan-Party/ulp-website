import { test, expect } from '@playwright/test';
test('public GET counters need no ULP backend and preserve historical and last good values', async ({
  page,
}) => {
  let backend = 0,
    fail = false;
  page.on('request', (r) => {
    if (r.url().includes('/api/social-stats')) backend++;
  });
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.route('https://api.fxtwitter.com/ulpugr', (route) =>
    fail
      ? route.abort()
      : route.fulfill({
          json: { user: { screen_name: 'ulpugr', followers: 789 } },
        }),
  );
  await page.route('https://discord.com/api/**', (route) =>
    route.fulfill({
      json: { code: 'FWW9wKZjav', approximate_member_count: 413 },
    }),
  );
  await page.goto('/info/rrss');
  const row = page.locator('[data-social-network="x"]');
  await expect(row.locator('[data-social-current]')).toHaveText('789');
  await expect(row.locator('[data-edition="2026"]')).toHaveText('813');
  await expect(page.locator('[data-social-total]')).toHaveText(/1[.,]?202/);
  await expect(page.locator('[data-social-total-note]')).toHaveText(
    'Parcial · 2 de 7 redes',
  );
  await expect(
    page.locator('[data-social-network="instagram"] [data-social-current]'),
  ).toHaveText('—');
  fail = true;
  await page.locator('[data-social-refresh]').click();
  await expect(row.locator('[data-social-info]')).toHaveText(
    'Último dato disponible',
  );
  expect(backend).toBe(0);
});
