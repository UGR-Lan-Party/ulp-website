import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('Ping pong muestra sus 24 cruces reales sin inventar marcadores ni fase final', async ({
  page,
}) => {
  await page.goto('/actividades/ping-pong/');
  const section = page.locator('[data-matchups]');
  await expect(section.locator('.matchup-group')).toHaveCount(8);
  await expect(section.locator('.match-card')).toHaveCount(24);
  await expect(section.locator('.match-card').first()).toContainText(
    'Carlos/Carri',
  );
  await expect(section.locator('.match-card').first()).toContainText(
    'El_chauchinero',
  );
  await expect(section).toContainText('No hay marcadores');
  await expect(section).not.toContainText('@');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await section.scrollIntoViewIfNeeded();
    expect(
      await section.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(section.locator('.match-card').first()).toBeVisible();
});

test('Los resultados parciales preservan el cero y la ausencia y las listas no implican cruces', async ({
  page,
}) => {
  await page.goto('/actividades/mario-kart/');
  const reader = page.locator('[data-matchups] tbody tr').filter({
    has: page.getByRole('rowheader', { name: 'Reader', exact: true }),
  });
  await expect(reader.locator('td')).toHaveText(['0', '—']);
  await page.goto('/actividades/minecraft/');
  await expect(page.locator('.matchup-group')).toHaveCount(6);
  const hg2 = page.locator('.tournament-table').filter({
    hasText: 'Juegos del Hambre · partida 2',
  });
  await hg2.locator('summary').click();
  const aris = hg2.locator('tbody tr').filter({
    has: page.getByRole('rowheader', { name: 'Aris3121', exact: true }),
  });
  await expect(aris.locator('td')).toHaveText(['5', '1']);
  await page.goto('/actividades/rocket-league/');
  await expect(page.locator('.match-card')).toHaveCount(0);
  const roster = page.locator('.tournament-roster');
  await roster.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(roster).toContainText('Leones de Montepinar');
  await expect(roster).toContainText('no determina los cruces');
  await page.goto('/actividades/paella/');
  await expect(page.locator('[data-matchups]')).toHaveCount(0);
});

test('El cuadro de Smash conserva marcadores y conexiones y permite navegar las fases', async ({
  page,
}) => {
  await page.goto('/actividades/smash/');
  const section = page.locator('[data-matchups]');
  await expect(section.locator('[data-match-id]')).toHaveCount(63);
  const winners = section.locator('[data-bracket]').first();
  await expect(winners).toHaveAttribute('open');
  await expect(winners.locator('[data-bracket-lines] path')).toHaveCount(7);
  const final = winners
    .locator('.bracket-round')
    .last()
    .locator('.bracket-match');
  await expect(final.locator('.bracket-player strong')).toHaveText(['3', '1']);
  await expect(final.locator('.is-winner')).toContainText('Paquito');
  const repechage = section.locator('[data-bracket]').nth(1);
  await repechage.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(repechage).toHaveAttribute('open');
  await expect(
    repechage.locator('[data-bracket-lines] path').first(),
  ).toBeAttached();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const region = winners.getByRole('region', { name: /^Cuadro Top 16/ });
    await region.focus();
    await page.keyboard.press('End');
    await expect(final).toBeAttached();
  }
});
