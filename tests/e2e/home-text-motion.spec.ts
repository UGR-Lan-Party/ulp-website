import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

test('El titular se desplaza en direcciones opuestas y se detiene al reducir movimiento', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => scrollTo({ top: 280, behavior: 'instant' }));
  const firstLine = page.locator('.hero-title-line');
  const secondLine = page.locator('.hero-title-party');
  const displacement = (element: HTMLElement) =>
    new DOMMatrix(getComputedStyle(element).transform).m41;
  await expect.poll(() => firstLine.evaluate(displacement)).toBeLessThan(-1);
  await expect.poll(() => secondLine.evaluate(displacement)).toBeGreaterThan(1);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(firstLine).toHaveCSS('transform', 'none');
  await expect(secondLine).toHaveCSS('transform', 'none');
});

test('Las palabras vuelven a animarse al entrar desde ambos sentidos y terminan legibles', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const heading = page.getByRole('heading', {
    name: 'Compite en tus juegos favoritos',
  });
  await heading.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      heading.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBeGreaterThan(0);
  await expect
    .poll(() =>
      heading.evaluate(
        (element) => element.getAnimations({ subtree: true }).length,
      ),
    )
    .toBe(0);
  for (const edge of ['top', 'bottom']) {
    await page.evaluate(
      (position) =>
        scrollTo({
          top: position === 'top' ? 0 : document.documentElement.scrollHeight,
          behavior: 'instant',
        }),
      edge,
    );
    await expect(heading).not.toBeInViewport();
    await heading.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        heading.evaluate(
          (element) => element.getAnimations({ subtree: true }).length,
        ),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        heading.evaluate(
          (element) => element.getAnimations({ subtree: true }).length,
        ),
      )
      .toBe(0);
  }
  await expect(heading).toBeVisible();
  expect(
    await heading.evaluate((element) =>
      [...element.querySelectorAll('span')].every(
        (word) => getComputedStyle(word).opacity === '1',
      ),
    ),
  ).toBe(true);
});

test('Los titulares siguen visibles sin JavaScript en 320 px', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  const page = await context.newPage();
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  try {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'UGR LAN Party', exact: true }),
    ).toBeVisible();
    const heading = page.getByRole('heading', {
      name: 'Compite en tus juegos favoritos',
    });
    await expect(heading).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});
