import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

for (const url of ['/info/mapa/', '/info/mapa/obs/?controles=1']) {
  for (const gesture of ['wheel', 'pinch', 'drag'] as const) {
    test(`El gesto ${gesture} actualiza solo el encuadre por fotograma: ${url}`, async ({
      page,
    }, info) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.route('https://**', (r) =>
        r.fulfill({ status: 200, body: '' }),
      );
      await page.goto(url);
      if (url.includes('/obs/'))
        await page
          .getByRole('button', { name: 'Mostrar controles', exact: true })
          .click();
      await page
        .locator('[data-route-form]')
        .evaluate((form: HTMLFormElement) => form.requestSubmit());
      await expect(page.locator('[data-route-layer] path')).toHaveCount(2);
      await page
        .getByRole('button', { name: 'Acercar plano', exact: true })
        .click();
      const drawing = page.locator('[data-venue-drawing]');
      await drawing.scrollIntoViewIfNeeded();
      const before = await drawing.getAttribute('viewBox');
      const box = (await drawing.boundingBox())!;
      const cx = box.x + box.width / 2,
        cy = box.y + box.height / 2;
      const cdp = await page.context().newCDPSession(page);
      if (gesture === 'drag') {
        await drawing.evaluate((el) =>
          el.addEventListener(
            'pointerdown',
            (e) => {
              (window as any).gesturePointer = (e as PointerEvent).pointerId;
            },
            { once: true },
          ),
        );
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: cx, y: cy }],
        });
      }
      const measurements = await drawing.evaluate(
        async (el, { gesture, cx, cy }) => {
          const drawing = el as SVGSVGElement;
          const map = drawing.closest('[data-venue-map]')!;
          const route = map.querySelector('[data-route-layer]')!;
          const paths = [...route.children];
          let reads = 0;
          const getBox = drawing.getBoundingClientRect;
          drawing.getBoundingClientRect = () => {
            reads++;
            return getBox.call(drawing);
          };
          const records: MutationRecord[] = [];
          const observer = new MutationObserver((items) =>
            records.push(...items),
          );
          observer.observe(map, {
            attributes: true,
            childList: true,
            subtree: true,
          });
          const touches = (distance: number) =>
            [-1, 1].map(
              (sign, i) =>
                new Touch({
                  identifier: i,
                  target: drawing,
                  clientX: cx + sign * distance,
                  clientY: cy,
                }),
            );
          if (gesture === 'pinch')
            drawing.dispatchEvent(
              new TouchEvent('touchstart', {
                touches: touches(40),
                cancelable: true,
                bubbles: true,
              }),
            );
          const start = performance.now();
          for (let i = 1; i <= 40; i++) {
            if (gesture === 'wheel')
              drawing.dispatchEvent(
                new WheelEvent('wheel', {
                  deltaY: -2,
                  clientX: cx,
                  clientY: cy,
                  cancelable: true,
                  bubbles: true,
                }),
              );
            else if (gesture === 'pinch')
              drawing.dispatchEvent(
                new TouchEvent('touchmove', {
                  touches: touches(40 + i * 0.5),
                  cancelable: true,
                  bubbles: true,
                }),
              );
            else
              drawing.dispatchEvent(
                new PointerEvent('pointermove', {
                  pointerId: (window as any).gesturePointer,
                  pointerType: 'touch',
                  isPrimary: true,
                  clientX: cx + i,
                  clientY: cy + i / 2,
                  bubbles: true,
                }),
              );
          }
          const dispatchMs = performance.now() - start;
          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);
          records.push(...observer.takeRecords());
          observer.disconnect();
          drawing.getBoundingClientRect = getBox;
          return {
            reads,
            dispatchMs,
            viewBoxWrites: records.filter(
              (r) => r.target === drawing && r.attributeName === 'viewBox',
            ).length,
            controlChanges: records.filter((r) =>
              (r.target as Element).closest(
                '.venue-selectors, [data-venue-view-status], [data-venue-room-capacity]',
              ),
            ).length,
            routePreserved: paths.every(
              (path, i) => route.children[i] === path,
            ),
            totalMutations: records.length,
          };
        },
        { gesture, cx, cy },
      );
      if (gesture === 'drag')
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchEnd',
          touchPoints: [],
        });
      if (gesture === 'pinch')
        await drawing.evaluate((el) =>
          el.dispatchEvent(
            new TouchEvent('touchend', {
              touches: [],
              bubbles: true,
              cancelable: true,
            }),
          ),
        );
      await cdp.detach();
      await info.attach('gesture-work.json', {
        body: JSON.stringify(measurements),
        contentType: 'application/json',
      });
      await expect(drawing).not.toHaveAttribute('viewBox', before!);
      expect(measurements.routePreserved).toBe(true);
      expect(measurements.controlChanges).toBe(0);
      expect(measurements.viewBoxWrites).toBeGreaterThan(0);
      expect(measurements.viewBoxWrites).toBeLessThanOrEqual(2);
      expect(measurements.reads).toBeLessThanOrEqual(1);
      await page
        .getByRole('button', {
          name: 'Restablecer zoom del plano',
          exact: true,
        })
        .click();
      await expect(page.locator('[data-venue-zoom-value]')).toHaveText('100%');
      await expect(page.locator('[data-route-layer] path')).toHaveCount(2);
    });
  }
}
