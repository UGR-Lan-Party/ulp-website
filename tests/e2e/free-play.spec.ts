import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const width of [1440, 390, 320]) {
  test(`Free play filters and themes remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/juego-libre/');
    await expect(page).toHaveTitle('Juego libre | UGR LAN Party');
    await expect(page.locator('main h1')).toHaveCount(1);
    const filters = page.getByRole('form', {
      name: 'Encuentra tu experiencia',
    });
    await expect(filters).toBeVisible();
    await expect(page.locator('[data-experience]:visible')).toHaveCount(8);
    await page.getByRole('button', { name: /^Tiempo disponible:/ }).click();
    await page
      .getByRole('option', { name: 'Unos 15 minutos', exact: true })
      .click();
    await page.getByRole('button', { name: /^Tu grupo:/ }).click();
    await page.getByRole('option', { name: 'A mi aire', exact: true }).click();
    await page.getByRole('button', { name: /^Tipo de experiencia:/ }).click();
    await page
      .getByRole('option', { name: 'Probar algo nuevo', exact: true })
      .click();
    await expect(page.locator('[data-experience="hacking"]')).toBeHidden();
    await expect(page.locator('[data-experience="vr"]')).toBeVisible();
    await expect(page.locator('[data-play-status]')).toHaveText(
      '3 experiencias para explorar',
    );
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(page.locator('[data-experience]:visible')).toHaveCount(8);
    for (const dark of [false, true]) {
      await page.evaluate(
        (d) => document.documentElement.classList.toggle('dark', d),
        dark,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    const map = page.locator('[data-experience="ping-pong"] a');
    await expect(map).toHaveAttribute(
      'href',
      '/info/horarios/?plano=bajo-exterior#plano',
    );
    expect(errors).toEqual([]);
  });
}
test('The full experience catalog remains available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/juego-libre/');
  await expect(page.locator('[data-experience]')).toHaveCount(8);
  await expect(page.locator('[data-play-filters]')).toBeHidden();
  await expect(
    page.getByText('Experiencias de 2026 · preparando ULP 2027'),
  ).toBeVisible();
  await context.close();
});

test('Custom selectors support keyboard, Escape, outside clicks and reset', async ({
  page,
}) => {
  await page.goto('/juego-libre/');
  const time = page.getByRole('button', { name: /^Tiempo disponible:/ });
  await time.focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('option', { name: 'Tiempo para explorar', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(time).toHaveAccessibleName('Tiempo disponible: Unos 15 minutos');
  await expect(time).toBeFocused();
  await time.click();
  await page.keyboard.press('Escape');
  await expect(time).toHaveAttribute('aria-expanded', 'false');
  await expect(time).toBeFocused();
  await time.click();
  await page.getByRole('heading', { level: 1 }).click();
  await expect(time).toHaveAttribute('aria-expanded', 'false');
  await time.click();
  await page.getByRole('button', { name: /^Tu grupo:/ }).click();
  await expect(time).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reiniciar' }).click();
  await expect(time).toHaveAccessibleName(
    'Tiempo disponible: Tiempo para explorar',
  );
});
