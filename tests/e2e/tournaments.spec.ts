import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
test('Previous nicknames and results are absent outside LoL; dynamic brackets retain TBD', async ({
  page,
}) => {
  test.slow();
  for (const id of [
    'ping-pong',
    'smash',
    'minecraft',
    'mario-kart',
    'rocket-league',
    'ajedrez',
    'futbolin',
    'brawl-stars',
    'clash-royale',
    'wii-sports-tenis',
    'wii-sports-bolos',
    'hacking',
  ]) {
    await page.goto(`/actividades/${id}/`);
    const section = page.locator('[data-matchups]');
    await expect(
      section.locator(
        '.tournament-roster,.matchup-group,.tournament-table,[data-match-id]',
      ),
    ).toHaveCount(0);
    await expect(section.locator('[data-format-builder]')).toBeVisible();
    await expect(section).toContainText('TBD');
    await expect(section).not.toContainText('La hoja conserva');
    await expect(section).not.toContainText('esta simulación no modifica');
  }
  await page.goto('/actividades/league-of-legends/');
  await expect(page.locator('.tournament-roster')).toHaveCount(1);
  await page.locator('.tournament-roster>summary').click();
  await expect(page.locator('.tournament-roster')).toContainText('Equipos');
});
test('Mario Kart uses jugadores and preserves its capacity selector without old scores', async ({
  page,
}) => {
  await page.goto('/actividades/mario-kart/');
  const builder = page.locator('[data-format-builder]');
  await expect(builder).toContainText('Series de cuatro jugadores');
  await expect(page.locator('[data-matchups]')).not.toContainText('Reader');
  await builder.locator('[data-format-capacity]').selectOption('24');
  await expect(builder.locator('[data-format-status]')).toContainText(
    '24 plazas',
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
