import { test, expect } from '@playwright/test';
test('Every dropdown starts at a format-specific minimum', async ({
  page,
}) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
  for (const [id, minimum] of [
    ['league-of-legends', 8],
    ['minecraft', 8],
    ['wii-sports-tenis', 12],
    ['wii-sports-bolos', 16],
    ['tetris', 4],
  ] as const) {
    await page.goto(`/actividades/${id}/`);
    const select = page.locator('[data-format-capacity]');
    await expect(select.locator('option').first()).toHaveAttribute(
      'value',
      String(minimum),
    );
    await select.selectOption(String(minimum));
    await expect(page.locator('[data-format-status]')).toContainText(
      `${minimum} plazas`,
    );
  }
});
