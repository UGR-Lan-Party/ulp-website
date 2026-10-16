import { test, expect } from '@playwright/test';
import program from '../../src/data/program-2026.json' with { type: 'json' };

test('Las 26 fichas conservan sus datos, reglas y premios en móvil sin JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  await context.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  const page = await context.newPage();
  try {
    for (const game of program.games) {
      await page.goto(`/actividades/${game.id}/`);
      await expect(page.locator('main h1')).toHaveText(game.name);
      await expect(page.locator('.registration-card')).toContainText(
        'Esta edición ha finalizado',
      );
      await expect(
        page.getByRole('link', { name: 'Consultar horarios', exact: true }),
      ).toHaveAttribute('href', '/horarios');
      const rules = page.locator('[data-analytics-event="rules-click"]');
      if (game.rules) await expect(rules).toHaveAttribute('href', game.rules);
      else await expect(rules).toHaveCount(0);
      const awards =
        'awards' in game && game.awards
          ? Object.values(game.awards).flat()
          : [];
      await expect(page.locator('.awards-list li')).toHaveText(awards);
      await expect(page.locator('.schedule-time')).toHaveCount(
        game.schedule.length,
      );
      await expect(
        page.locator('.holographic-competition-card img'),
      ).toHaveCount(2);
      await expect(page.locator('main')).not.toContainText(
        'Carta holográfica interactiva',
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        game.id,
      ).toBe(true);
    }
  } finally {
    await context.close();
  }
});

test('La carta mantiene la interacción y se detiene al reducir el movimiento', async ({
  page,
}) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/actividades/ajedrez/');
  const card = page.locator('#holo-card');
  const bounds = (await card.boundingBox())!;
  await page.mouse.move(bounds.x + 70, bounds.y + 90);
  await expect
    .poll(() => card.evaluate((element) => element.style.transform))
    .toContain('rotate3d');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).toHaveCSS('transform', 'none');
  await expect(card).toHaveCSS('animation-name', 'none');
});

test('Los premios recuperan la tipografía retro y las animaciones respetan movimiento reducido', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/actividades/hacking/');
  const medal = page.locator('.award-medal').first();
  await expect(medal).toHaveCSS('animation-name', /medal-float/);
  const title = page.locator('.award-card h3').first();
  await title.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await expect(title).toHaveCSS('font-family', /ULP Arcade/);
  expect(
    await page.evaluate(() => document.fonts.check('12px "ULP Arcade"')),
  ).toBe(true);
  await expect(page.locator('.trophy-heading h3')).toHaveText(
    'Trofeo Hacking Ético',
  );
  const background = page.locator('.trophy-backdrop');
  await expect(background).toHaveCSS('opacity', '0.09');
  await expect(background).toHaveCSS('filter', 'saturate(0.15)');
  await expect(page.locator('.trophy-showcase')).toHaveCSS(
    'background-color',
    'rgb(6, 45, 67)',
  );
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('.trophy-showcase')).toHaveCSS(
    'background-color',
    'rgb(6, 45, 67)',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(medal).toHaveCSS('animation-name', 'none');
  await expect(title).toHaveCSS('animation-name', 'none');
});

test('Las flechas de la ficha siguen el orden del catálogo y cierran el recorrido', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/actividades/mario-kart/');
  await expect(page.locator('.activity-next')).toHaveAttribute(
    'href',
    '/actividades/clash-royale',
  );
  await page.locator('.activity-next').click();
  await expect(page.locator('main h1')).toHaveText('Clash Royale');
  await page.locator('.activity-previous').click();
  await expect(page.locator('main h1')).toHaveText('Mario Kart World');
  await page.locator('.activity-previous').click();
  await expect(page.locator('main h1')).toHaveText('Hacking Ético');
  await expect(page.locator('.activity-next')).toHaveAttribute(
    'href',
    '/actividades/mario-kart',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
