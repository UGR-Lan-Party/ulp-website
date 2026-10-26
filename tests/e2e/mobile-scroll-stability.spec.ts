import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (r) => r.fulfill({ status: 200, body: '' }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    (window as any).scrollEntrances = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = original.apply(this, args);
      if (this.matches('[data-reveal], [data-text-word], [data-partner-rise]'))
        (window as any).scrollEntrances.push({
          target: this,
          options: args[1],
          frames: (animation.effect as KeyframeEffect).getKeyframes(),
          animation,
        });
      return animation;
    };
  });
});

async function expectOriginalHeadingMotion(page: Page) {
  const heading = page.locator('#experience-title');
  await heading.scrollIntoViewIfNeeded();
  const words = await heading.locator('[data-text-word]').count();
  await expect
    .poll(() =>
      heading.evaluate(
        (el) =>
          (window as any).scrollEntrances.filter((r: { target: Element }) =>
            el.contains(r.target),
          ).length,
      ),
    )
    .toBe(words);
  const entries = await heading.evaluate((el) =>
    (window as any).scrollEntrances
      .filter((r: { target: Element }) => el.contains(r.target))
      .map(
        (r: {
          frames: ComputedKeyframe[];
          options: KeyframeAnimationOptions;
        }) => ({
          opacity: r.frames[0].opacity,
          fromBlur: r.frames[0].filter,
          toBlur: r.frames.at(-1)?.filter,
          duration: r.options.duration,
          delay: r.options.delay,
        }),
      ),
  );
  for (let i = 0; i < words; i++) {
    expect(entries[i]).toEqual({
      opacity: '0.15',
      fromBlur: 'blur(5px)',
      toBlur: 'blur(0px)',
      duration: 800,
      delay: i * 85,
    });
  }
  await heading.evaluate(async (el) => {
    const animations = el.getAnimations({ subtree: true });
    await Promise.all(animations.map((a) => a.finished.catch(() => {})));
  });
}

test.describe('Entradas visibles sin parpadeo en móvil', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test('Un bloque inferior espera a entrar en pantalla y su animación mueve contenido visible', async ({
    page,
  }, info) => {
    await page.goto('/');
    const block = page.locator('[data-reveal]').last();
    expect((await block.boundingBox())!.y).toBeGreaterThan(844);
    expect(
      await block.evaluate(
        (el) =>
          (window as any).scrollEntrances.filter(
            (r: { target: Element }) => r.target === el,
          ).length,
      ),
    ).toBe(0);
    await expect(block).toHaveCSS('opacity', '1');
    await block.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        block.evaluate(
          (el) =>
            (window as any).scrollEntrances.filter(
              (r: { target: Element }) => r.target === el,
            ).length,
        ),
      )
      .toBe(1);
    const during = await block.evaluate((el) => {
      const record = (window as any).scrollEntrances.find(
        (r: { target: Element }) => r.target === el,
      );
      record.animation.pause();
      record.animation.currentTime = 160;
      return {
        opacity: getComputedStyle(el).opacity,
        filter: getComputedStyle(el).filter,
        transform: getComputedStyle(el).transform,
      };
    });
    await page.screenshot({
      path: info.outputPath('mobile-visible-entry.png'),
    });
    const after = await block.evaluate((el) => {
      const record = (window as any).scrollEntrances.find(
        (r: { target: Element }) => r.target === el,
      );
      record.animation.currentTime = 650;
      return getComputedStyle(el).transform;
    });
    expect(during.opacity).toBe('1');
    expect(during.filter).toBe('none');
    expect(during.transform).not.toBe(after);
  });

  for (const url of [
    '/',
    '/actividades/',
    '/info/about/',
    '/info/ediciones_anteriores/',
    '/info/rrss/',
  ]) {
    test(`Las animaciones se ven al llegar, no ocultan contenido ni se repiten: ${url}`, async ({
      page,
    }) => {
      await page.goto(url);
      const blocks = page.locator(
        '[data-reveal], [data-home-text-reveal], [data-partner-rise], [data-linktree-showcase], .edition-timeline',
      );
      const count = await blocks.count();
      const selected = [
        ...new Set([0, 1, Math.floor(count / 2), count - 1]),
      ].filter((i) => i >= 0 && i < count);
      const firstCounts = new Map<number, number>();
      for (const index of [...selected, ...selected.toReversed()]) {
        const block = blocks.nth(index);
        await block.scrollIntoViewIfNeeded();
        const state = await block.evaluate(async (el) => {
          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);
          const entries = document.getAnimations().filter((a) => {
            const target =
              a.effect instanceof KeyframeEffect ? a.effect.target : null;
            return (
              target instanceof Element &&
              el.contains(target) &&
              (target.matches(
                '[data-reveal], [data-text-word], [data-partner-rise]',
              ) ||
                (a instanceof CSSAnimation &&
                  /^(phone-link-arrival|timeline-point)/.test(a.animationName)))
            );
          });
          await Promise.all(entries.map((a) => a.finished.catch(() => {})));
          const records = (
            (window as any).scrollEntrances as Array<{
              target: Element;
              frames: ComputedKeyframe[];
            }>
          ).filter((r) => el.contains(r.target));
          return {
            calls: records.length,
            opaque: records
              .filter((r) => !r.target.matches('[data-text-word]'))
              .every((r) =>
                r.frames.every(
                  (frame) =>
                    frame.opacity === undefined || Number(frame.opacity) === 1,
                ),
              ),
            sharp: records
              .filter((r) => !r.target.matches('[data-text-word]'))
              .every((r) =>
                r.frames.every(
                  (frame) =>
                    frame.filter === undefined ||
                    frame.filter === 'none' ||
                    frame.filter === 'blur(0px)',
                ),
              ),
            opacity: getComputedStyle(el).opacity,
            regular: el.matches(
              '[data-reveal], [data-home-text-reveal], [data-partner-rise]',
            ),
          };
        });
        expect(state.opacity).toBe('1');
        expect(state.opaque).toBe(true);
        expect(state.sharp).toBe(true);
        if (state.regular) expect(state.calls).toBeGreaterThan(0);
        if (firstCounts.has(index))
          expect(state.calls).toBe(firstCounts.get(index));
        else firstCounts.set(index, state.calls);
      }
      for (const image of await page
        .locator(
          '[data-carousel-image], [data-carousel-neighbor] img, [data-partner-logo]',
        )
        .all())
        await expect(image).toHaveAttribute('loading', 'eager');
    });
  }
  test('Compite en tus juegos favoritos conserva el difuminado original y no lo repite', async ({
    page,
  }) => {
    await page.goto('/');
    await expectOriginalHeadingMotion(page);
    const before = await page.evaluate(
      () =>
        (window as any).scrollEntrances.filter((r: { target: Element }) =>
          r.target.matches('[data-text-word]'),
        ).length,
    );
    await page.locator('[data-reveal]').last().scrollIntoViewIfNeeded();
    await page.locator('#experience-title').scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    });
    expect(
      await page.evaluate(
        () =>
          (window as any).scrollEntrances.filter((r: { target: Element }) =>
            r.target.matches('[data-text-word]'),
          ).length,
      ),
    ).toBe(before);
  });
  test('Movimiento reducido sigue respetándose', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('[data-reveal]').last().scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(() => (window as any).scrollEntrances.length),
    ).toBe(0);
    await expect(page.locator('.hero-copy')).toHaveCSS('opacity', '1');
  });
});

test('Escritorio conserva las entradas originales', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expectOriginalHeadingMotion(page);
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).scrollEntrances.some(
          (a: { options?: { duration?: number } }) =>
            a.options?.duration === 650,
        ),
      ),
    )
    .toBe(true);
  await page
    .locator('[data-home-text-reveal]')
    .first()
    .scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).scrollEntrances.some(
          (a: { options?: { duration?: number } }) =>
            a.options?.duration === 800,
        ),
      ),
    )
    .toBe(true);
});
