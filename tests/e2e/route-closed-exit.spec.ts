import { test, expect } from '@playwright/test';
test('Grados routes exclude the closed auxiliary exit', async ({page}) => {
  await page.route('https://**', r => r.fulfill({status: 200, body: ''}));
  await page.goto('/info/horarios/');
  await page.locator('[data-route-panel] summary').click();
  await page.locator('[data-route-origin]').selectOption('grados');
  await page.locator('[data-route-destination]').selectOption('bancos-rojos');
  await page
    .locator('[data-route-form]')
    .evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator('[data-venue-map]')).toHaveAttribute(
    'data-venue-plan',
    'principal-0',
  );
  await expect(
    page.locator('[data-venue-floor-plan="principal-0"]'),
  ).toContainText('Cerrada durante la ULP');
  await expect(page.locator('[data-route-steps] button').last()).toContainText(
    'Recinto y exteriores',
  );
});
