import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`Concierto enlaza el programa y conserva la agenda existente a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://**', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );
    await page.goto('/actividades/');
    const tile = page.locator('.activity-tile[href="/actividades/concierto"]');
    await expect(tile).toHaveCount(1);
    await tile.click();
    await expect(page.locator('h1')).toHaveText('Concierto');
    await expect(page.locator('.summary-schedule')).toContainText(
      '19:00–20:00',
    );
    await expect(page.locator('.activity-summary')).toContainText(
      'Salón de Actos',
    );
    const agenda = await page
      .locator('[data-agenda-data]')
      .evaluate((node) => JSON.parse(node.textContent!));
    const concerts = agenda.entries.filter(
      (entry: { href: string }) => entry.href === '/actividades/concierto',
    );
    expect(concerts).toHaveLength(1);
    expect(concerts[0].activityId).toBe('charla-6');
    const save = page.locator('.activity-summary [data-agenda-toggle]');
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem('ulp-agenda:2026:v1')!),
      ),
    ).toContain(concerts[0].key);
    await expect(page.locator('.concert-replay')).toContainText('Próximamente');
    await expect(
      page.locator('.concert-replay iframe, .concert-replay button'),
    ).toHaveCount(0);
    const photo = page.locator('.concert-experience figure img');
    await photo.scrollIntoViewIfNeeded();
    await photo.evaluate(async (node: HTMLImageElement) => node.decode());
    await page
      .locator('.concert-experience')
      .screenshot({ path: testInfo.outputPath(`concert-story-${width}.png`) });
    await page
      .locator('.concert-replay')
      .screenshot({ path: testInfo.outputPath(`concert-replay-${width}.png`) });
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /desde las 19:00/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

  test(`Pokémon TCG incluye su fotografía a ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/actividades/tcg/');
    const section = page.locator('.tcg-showcase');
    await section.scrollIntoViewIfNeeded();
    const image = section.locator('img');
    await image.evaluate(async (node: HTMLImageElement) => node.decode());
    expect(
      await image.evaluate((node: HTMLImageElement) => node.naturalWidth),
    ).toBeGreaterThanOrEqual(1536);
    await expect(section.locator('a')).toHaveAttribute(
      'href',
      '/assets/activities/tcg/stand-0895.webp',
    );
    await section.screenshot({
      path: testInfo.outputPath(`tcg-showcase-${width}.png`),
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
