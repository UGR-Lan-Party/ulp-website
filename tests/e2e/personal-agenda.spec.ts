import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('Guardar desde una ficha persiste solo IDs, se refleja en la tabla y permite exportar y vaciar', async ({
  page,
}) => {
  await page.goto('/actividades/ajedrez/');
  const summary = page.getByRole('region', { name: 'Resumen de la actividad' });
  await expect(summary).toContainText('Cerrada · archivo 2026');
  const save = summary.locator('[data-agenda-toggle]');
  await expect(save).toHaveAccessibleName('Guardar en mi agenda: Ajedrez');
  await save.focus();
  await page.keyboard.press('Enter');
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('ulp-agenda:2026:v1')!),
  );
  expect(stored).toHaveLength(1);
  expect(
    stored.every(
      (id: unknown) => typeof id === 'string' && id.startsWith('2026:ajedrez:'),
    ),
  ).toBe(true);
  await page.goto('/info/horarios/#mi-agenda');
  const panel = page.locator('[data-personal-agenda]');
  await expect(panel.locator('[data-agenda-list] li')).toHaveCount(1);
  await expect(panel.locator('[data-agenda-list]')).toContainText('Ajedrez');
  await page.reload();
  await expect(panel.locator('[data-agenda-list] li')).toHaveCount(1);
  const downloaded = page.waitForEvent('download');
  await panel
    .getByRole('button', { name: 'Descargar calendario (.ics)' })
    .click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('mi-agenda-ulp-2026.ics');
  const content = await readFile((await download.path())!, 'utf8');
  expect(content).toContain('DTSTART:20260321T090000Z');
  expect(content).toContain('SUMMARY:Ajedrez · ULP 2026');
  await panel.getByRole('button', { name: 'Vaciar agenda' }).click();
  await expect(panel.locator('[data-agenda-list] li')).toHaveCount(0);
  await expect(panel.locator('#personal-agenda-title')).toBeFocused();
  await expect(panel.locator('[data-agenda-export]')).toBeDisabled();
});

test('Seleccionar dos franjas solapadas muestra el aviso y quitar una restaura el foco', async ({
  page,
}) => {
  await page.goto('/info/horarios/');
  const entries = JSON.parse(
    (await page.locator('[data-agenda-data]').textContent())!,
  ).entries;
  let pair: number[] = [];
  for (let i = 0; i < entries.length && !pair.length; i++)
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i],
        b = entries[j];
      if (
        a.endsAt &&
        b.endsAt &&
        Date.parse(a.startsAt) < Date.parse(b.endsAt) &&
        Date.parse(b.startsAt) < Date.parse(a.endsAt)
      ) {
        pair = [i, j];
        break;
      }
    }
  expect(pair).toHaveLength(2);
  const buttons = page.locator('[data-program-row] [data-agenda-toggle]');
  await buttons.nth(pair[0]).click();
  await buttons.nth(pair[1]).click();
  const panel = page.locator('[data-personal-agenda]');
  await expect(panel.locator('[data-agenda-conflicts]')).toBeVisible();
  await expect(panel.locator('[data-agenda-conflict-list] li')).toHaveCount(1);
  await panel.locator('[data-agenda-list] button').first().click();
  await expect(panel.locator('[data-agenda-conflicts]')).toBeHidden();
  await expect(
    panel.locator('[data-agenda-list] button').first(),
  ).toBeFocused();
  await expect(panel.locator('[data-agenda-list] li')).toHaveCount(1);
});

test('La agenda sigue funcionando con almacenamiento bloqueado y cabe en 320 px', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error('Bloqueado');
    };
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/info/horarios/');
  await page.locator('[data-program-row] [data-agenda-toggle]').first().click();
  const panel = page.locator('[data-personal-agenda]');
  await expect(panel.locator('[data-agenda-storage]')).toBeVisible();
  await expect(panel.locator('[data-agenda-list] li')).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('Three.js y GSAP esperan a que el usuario se acerque o abra sus componentes', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/actividades/ajedrez/');
  expect(requests.some((url) => url.includes('trophy-scene'))).toBe(false);
  expect(requests.some((url) => url.endsWith('.obj'))).toBe(false);
  await page.goto('/info/horarios/');
  expect(requests.some((url) => url.includes('ScrollTrigger'))).toBe(false);
});
