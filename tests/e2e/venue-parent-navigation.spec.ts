import { test, expect } from '@playwright/test';
test.describe.configure({ mode: 'parallel' });
const parents = [
  ['principal-0', 'recinto'],
  ['principal-baja', 'recinto'],
  ['aulario-0', 'recinto'],
  ['aulario-1', 'recinto'],
  ['aulas-inferiores', 'recinto'],
  ['prefabricadas-a', 'recinto'],
  ['prefabricadas-b', 'recinto'],
  ['bancos-rojos', 'recinto'],
  ['bajo-exterior', 'recinto'],
  ['principal-hall', 'principal-0'],
  ['principal-grados', 'principal-0'],
  ['principal-estudiantes', 'principal-baja'],
  ['principal-actos', 'principal-baja'],
];
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
});
for (const url of ['/info/mapa/', '/info/mapa/obs/'])
  for (const width of [390, 1440])
    test(`Each detail view returns to its parent at ${width}px on ${url}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      for (const [plan, parent] of parents) {
        await page.goto(`${url}?plano=${plan}`);
        const map = page.locator('[data-venue-map]'),
          back = page.locator('[data-venue-parent-back]'),
          canvas = page.locator('.venue-canvas');
        await expect(map).toHaveAttribute('data-venue-plan', plan);
        await expect(back).toBeVisible();
        await back.scrollIntoViewIfNeeded();
        const b = (await back.boundingBox())!,
          c = (await canvas.boundingBox())!;
        expect(Math.abs(b.y - c.y - 12)).toBeLessThan(2);
        expect(Math.abs(b.x + b.width - c.x - c.width + 12)).toBeLessThan(2);
        expect(b.height).toBeGreaterThanOrEqual(44);
        await back.focus();
        await page.keyboard.press('Enter');
        await expect(map).toHaveAttribute('data-venue-plan', parent);
        if (parent === 'recinto') await expect(back).toBeHidden();
        else {
          await expect(back).toBeFocused();
          await back.click();
          await expect(map).toHaveAttribute('data-venue-plan', 'recinto');
          await expect(back).toBeHidden();
        }
      }
    });
test('OBS toolbar keeps back navigation accessible and its settings panel below the controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/info/mapa/obs/?plano=principal-actos&controles=1');
  const back = page.locator('[data-venue-parent-back]'),
    map = page.locator('[data-venue-map]');
  await expect(back).toBeVisible();
  await expect(back).toContainText('planta baja');
  await page
    .getByRole('button', { name: 'Mostrar controles', exact: true })
    .click();
  await expect(page.locator('[data-venue-building-select]')).toBeVisible();
  await expect
    .poll(async () => {
      const tools = (await page.locator('[data-obs-tools]').boundingBox())!,
        panel = (await page.locator('.obs-map-config').boundingBox())!;
      return panel.y - tools.y - tools.height;
    })
    .toBeGreaterThanOrEqual(15);
  await back.click();
  await expect(map).toHaveAttribute('data-venue-plan', 'principal-baja');
  await back.click();
  await expect(map).toHaveAttribute('data-venue-plan', 'recinto');
  await expect(back).toBeHidden();
});
