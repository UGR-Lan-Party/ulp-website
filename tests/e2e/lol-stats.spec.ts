import { test, expect } from '@playwright/test';

test('LoL ofrece perfiles de 2026 por equipo en pestañas nuevas y funciona con ratón, teclado y móvil', async ({
  page,
  context,
}) => {
  await context.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.goto('/actividades/league-of-legends/');
  const roster = page.locator('.tournament-roster');
  await roster.locator('summary').click();
  const profiles = page.locator('[data-lol-roster] a');
  await expect(profiles).toHaveCount(77);
  await expect(page.locator('.roster-team')).toHaveCount(14);
  const player = profiles.filter({ hasText: 'Naifarer#ESP' });
  await expect(player).toHaveAttribute(
    'href',
    'https://op.gg/lol/summoners/euw/Naifarer-ESP',
  );
  await expect(player).toHaveAttribute('target', '_blank');
  await expect(player).toHaveAttribute('rel', 'noopener noreferrer');
  await player.hover();
  await expect(player.locator('.roster-player')).toHaveCSS(
    'text-decoration-line',
    'underline',
  );
  expect(context.pages()).toHaveLength(1);
  await player.focus();
  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press('Enter');
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://op.gg/lol/summoners/euw/Naifarer-ESP');
  await popup.close();
  await expect(page).toHaveURL(/league-of-legends/);
  await expect(
    profiles.filter({ hasText: 'Chicle de Menta#RANNI' }),
  ).toHaveAttribute(
    'href',
    'https://op.gg/lol/summoners/euw/Chicle%20de%20Menta-RANNI',
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(player).toBeVisible();
  await page.goto('/actividades/rocket-league/');
  await expect(page.locator('[data-lol-roster]')).toHaveCount(0);
});
