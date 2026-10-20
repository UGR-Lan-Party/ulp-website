import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});
for (const width of [1280, 390]) {
  test(`About muestra entidades por rangos y YouTube con activación voluntaria a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/info/about/');
    const wall = page.locator('.about-partners');
    await expect(wall.locator('[data-about-tier]')).toHaveCount(6);
    for (const tier of await wall.locator('[data-about-tier]').all()) {
      expect(await tier.locator('[data-partner-rise]').count()).toBeGreaterThan(
        0,
      );
      await expect(tier.locator('.partner-logo-frame').first()).toBeVisible();
    }
    for (const list of await wall.locator('.about-partner-logos').all()) {
      const rows = await list.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const groups = new Map<number, DOMRect[]>();
        for (const item of element.children) {
          const box = item.getBoundingClientRect();
          const key = Math.round(box.top);
          groups.set(key, [...(groups.get(key) ?? []), box]);
        }
        return [...groups.values()].map((items) =>
          Math.abs(
            (items[0].left + items.at(-1)!.right) / 2 -
              (bounds.left + bounds.width / 2),
          ),
        );
      });
      expect(rows.every((offset) => offset < 2)).toBe(true);
    }
    expect(
      await page.locator('#team').evaluate((element) =>
        (() => {
          let previous = element.previousElementSibling;
          while (previous && previous.tagName !== 'SECTION')
            previous = previous.previousElementSibling;
          return previous?.classList.contains('youtube-section');
        })(),
      ),
    ).toBe(true);
    const large = await wall
      .locator('[data-about-tier="diamond"] .partner-logo-frame')
      .first()
      .boundingBox();
    const small = await wall
      .locator('[data-about-tier="regular"] .partner-logo-frame')
      .first()
      .boundingBox();
    expect(large!.height).toBeGreaterThan(small!.height);
    const recording = (await page.locator('.youtube-recording').boundingBox())!;
    const copy = (await page.locator('.youtube-copy').boundingBox())!;
    if (width > 900) expect(recording.x + recording.width).toBeLessThan(copy.x);
    else expect(recording.y + recording.height).toBeLessThan(copy.y);
    await expect(page.locator('.youtube-subscribe')).toHaveAttribute(
      'href',
      'https://www.youtube.com/@ugrlanparty?sub_confirmation=1',
    );
    await expect(page.locator('[data-youtube-player] iframe')).toHaveCount(0);
    await page.locator('[data-youtube-play]').scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator('.youtube-preview img')
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    await page.locator('[data-youtube-play]').click();
    await expect(page.locator('[data-youtube-player] iframe')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/VBoMpaRcuSg?autoplay=1&rel=0',
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  });
}
