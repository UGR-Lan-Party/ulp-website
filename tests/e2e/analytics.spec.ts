import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({
      status: 200,
      body: '',
      contentType:
        route.request().resourceType() === 'stylesheet'
          ? 'text/css'
          : route.request().resourceType() === 'script'
            ? 'application/javascript'
            : 'text/html',
    }),
  );
});

test('Un clic en las reglas registra un único evento sin parámetros', async ({
  page,
}) => {
  const calls: unknown[] = [];
  await page.exposeFunction('captureEvent', (payload: unknown) =>
    calls.push(payload),
  );
  await page.addInitScript(() => {
    (window as any).umami = {
      track: (build: Function) =>
        (window as any).captureEvent(
          build({
            website: 'test-site',
            hostname: 'localhost',
            screen: '1280x720',
            language: 'es',
            referrer: 'https://example.invalid/?token=private',
          }),
        ),
    };
  });
  await page.goto('/actividades/ajedrez/?token=private');
  await page.locator('[data-analytics-event="rules-click"]').click();
  await expect.poll(() => calls.length).toBe(1);
  expect(calls[0]).toMatchObject({
    name: 'rules-click',
    url: '/actividades/ajedrez/',
    data: { edition: '2026', activity: 'ajedrez' },
  });
  expect(JSON.stringify(calls)).not.toContain('private');
});

for (const failure of ['absent', 'throws', 'rejects']) {
  test(`El enlace funciona si Umami ${failure}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/actividades/ajedrez/');
    await page.evaluate((mode) => {
      const tracker = window as any;
      if (mode === 'absent') delete tracker.umami;
      if (mode === 'throws')
        tracker.umami = {
          track: () => {
            throw Error('tracker failure');
          },
        };
      if (mode === 'rejects')
        tracker.umami = {
          track: () => Promise.reject(Error('tracker failure')),
        };
      const link = document.querySelector<HTMLAnchorElement>(
        '[data-analytics-event="rules-click"]',
      )!;
      link.href = '/blog/';
    }, failure);
    await page.locator('[data-analytics-event="rules-click"]').click();
    await expect(page).toHaveURL(/\/blog\/$/);
    expect(errors).toEqual([]);
  });
}

test('El dispatcher registra inscripción una sola vez aunque se pulse un elemento interior', async ({
  page,
}) => {
  const calls: unknown[] = [];
  await page.exposeFunction('captureEvent', (payload: unknown) =>
    calls.push(payload),
  );
  await page.goto('/actividades/ajedrez/');
  await page.evaluate(() => {
    (window as any).umami = {
      track: (build: Function) =>
        (window as any).captureEvent(build({ website: 'test-site' })),
    };
    const link = document.createElement('a');
    link.href = '#test-registration';
    link.style.display = 'block';
    link.style.marginTop = '200px';
    link.dataset.analyticsEvent = 'registration-click';
    link.dataset.analyticsEdition = '2027';
    link.dataset.analyticsActivity = 'test-activity';
    link.innerHTML = '<span>Inscripción de prueba</span>';
    document.querySelector('main')!.prepend(link);
  });
  await page.getByText('Inscripción de prueba', { exact: true }).click();
  await expect.poll(() => calls.length).toBe(1);
  expect(calls[0]).toMatchObject({
    name: 'registration-click',
    data: { edition: '2027', activity: 'test-activity' },
  });
});
