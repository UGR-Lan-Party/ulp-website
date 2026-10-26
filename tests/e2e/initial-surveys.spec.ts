import { test, expect } from '@playwright/test';
for (const width of [1440, 390])
  test(`Survey archive compares yearly votes and switches columns at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 1000 });
    await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
    await page.goto('/info/ediciones_anteriores/');
    const root = page.locator('[data-survey-comparison]');
    await expect(root.locator('[data-survey-metric]')).toHaveValue('votes');
    await expect(root.locator('.survey-votes').first()).toBeVisible();
    await expect(root.locator('.survey-value').first()).toBeHidden();
    await root.getByLabel('Todos los juegos').check();
    await root
      .getByRole('button', { name: /^Edición de la encuesta:/ })
      .click();
    await root.getByRole('option', { name: 'ULP 2025', exact: true }).click();
    const mario = root
      .locator('.survey-game')
      .filter({
        has: page.getByRole('heading', { name: 'Mario Kart', exact: true }),
      });
    await expect(mario.locator('.survey-votes')).toHaveText('112');
    await expect(root.locator('.survey-game')).toHaveCount(18);
    for (const mode of ['percent', 'votes', 'both']) {
      await root
        .getByRole('button', { name: /^Medida de las preferencias:/ })
        .click();
      await root
        .getByRole('option', {
          name: {
            percent: 'Porcentaje de respuestas',
            votes: 'Número de votos',
            both: 'Ambas',
          }[mode],
          exact: true,
        })
        .click();
      if (mode === 'votes')
        await expect(root.locator('.survey-value').first()).toBeHidden();
      else await expect(root.locator('.survey-value').first()).toBeVisible();
      if (mode === 'percent')
        await expect(root.locator('.survey-votes').first()).toBeHidden();
      else await expect(root.locator('.survey-votes').first()).toBeVisible();
      expect(
        await root.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBeTruthy();
    }
    await expect(root.getByText('Cómo leer la comparativa')).toHaveCount(0);
  });
