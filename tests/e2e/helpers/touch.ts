import type { Page, Locator } from '@playwright/test';

export async function swipe(page: Page, element: Locator, direction: -1 | 1) {
  await element.scrollIntoViewIfNeeded();
  const box = (await element.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  const from = box.x + box.width * (direction > 0 ? 0.75 : 0.25);
  const to = box.x + box.width * (direction > 0 ? 0.25 : 0.75);
  const y = box.y + box.height * 0.5;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: from, y }],
  });
  for (let step = 1; step <= 5; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: from + ((to - from) * step) / 5, y }],
    });
    await page.waitForTimeout(45);
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await session.detach();
}
