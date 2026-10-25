import { test, expect, type Page, type Locator } from '@playwright/test';
import sharp from 'sharp';

test.use({
  launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  viewport: { width: 1280, height: 1000 },
});

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

async function expectRenderedTrophy(page: Page, canvas: Locator) {
  await canvas.evaluate((element) =>
    element.scrollIntoView({ block: 'center' }),
  );
  const bounds = (await canvas.boundingBox())!;
  const { data, info } = await sharp(await canvas.screenshot())
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  await canvas.evaluate((element) => (element.style.visibility = 'hidden'));
  const background = await sharp(await page.screenshot({ clip: bounds }))
    .removeAlpha()
    .raw()
    .toBuffer();
  await canvas.evaluate((element) => (element.style.visibility = 'visible'));
  const corner = [...data.subarray(0, 3)];
  corner.forEach((channel, index) =>
    expect(Math.abs(channel - background[index])).toBeLessThan(3),
  );
  let renderedPixels = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    if (
      [0, 1, 2].some(
        (index) =>
          Math.abs(data[offset + index] - background[offset + index]) > 20,
      )
    )
      renderedPixels++;
  }
  expect(renderedPixels).toBeGreaterThan(200);
}

for (const theme of ['light', 'dark']) {
  test(`El trofeo se renderiza automáticamente y sin fondo opaco en tema ${theme}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(
      (value) => localStorage.setItem('theme', value),
      theme,
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/actividades/hacking/');
    const viewer = page.locator('[data-trophy]');
    await expect(viewer.getByRole('button', { name: 'Ver en 3D' })).toHaveCount(
      0,
    );
    await viewer.scrollIntoViewIfNeeded();
    await expect(viewer.locator('[data-trophy-status]')).toContainText(
      'Arrastra',
    );
    const canvas = viewer.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(viewer.locator('[data-trophy-inline] img')).toHaveCount(0);
    const context = await canvas.evaluate((element: HTMLCanvasElement) => {
      const gl = element.getContext('webgl2')!;
      return {
        alpha: gl.getContextAttributes()!.alpha,
        clearAlpha: gl.getParameter(gl.COLOR_CLEAR_VALUE)[3],
      };
    });
    expect(context).toEqual({ alpha: true, clearAlpha: 0 });
    await expectRenderedTrophy(page, canvas);
    await page.getByRole('button', { name: 'Modo oscuro' }).click();
    await expect(viewer.locator('canvas')).toHaveCount(1);
    await page.setViewportSize({ width: 360, height: 800 });
    await expect
      .poll(() =>
        canvas.evaluate((element: HTMLCanvasElement) => element.width),
      )
      .toBeLessThan(360);
    await expectRenderedTrophy(page, canvas);
    expect(errors).toEqual([]);
  });
}

test('Un fallo de red permite reintentar sin duplicar el visor', async ({
  page,
}) => {
  await page.route('**/assets/models/ctf.mtl', (route) =>
    route.fulfill({ status: 503, body: '' }),
  );
  await page.goto('/actividades/hacking/');
  const viewer = page.locator('[data-trophy]');
  await viewer.scrollIntoViewIfNeeded();
  const retry = viewer.getByRole('button', {
    name: 'Reintentar carga del trofeo',
  });
  await expect(retry).toBeVisible();
  await expect(viewer.locator('canvas')).toHaveCount(0);
  await page.unroute('**/assets/models/ctf.mtl');
  await retry.click();
  await expect(viewer.locator('[data-trophy-status]')).toContainText(
    'Arrastra',
  );
  await expect(retry).not.toBeVisible();
  await expect(viewer.locator('canvas')).toHaveCount(1);
});

test('El zoom máximo conserva todo el trofeo al girar, ampliar y cambiar a móvil', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/actividades/league-of-legends/');
  const viewer = page.locator('[data-trophy]');
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer.locator('[data-trophy-status]')).toContainText(
    'Arrastra',
  );
  const canvas = viewer.locator('canvas');
  async function checkMargins() {
    await canvas.scrollIntoViewIfNeeded();
    const bounds = (await canvas.boundingBox())!;
    await page.mouse.move(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    for (let index = 0; index < 8; index++) await page.mouse.wheel(0, -800);
    // Wait for the frame requested by OrbitControls in reduced-motion mode.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const { data, info } = await sharp(await canvas.screenshot())
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    await canvas.evaluate((element) => (element.style.visibility = 'hidden'));
    const background = await sharp(await page.screenshot({ clip: bounds }))
      .removeAlpha()
      .raw()
      .toBuffer();
    await canvas.evaluate((element) => (element.style.visibility = 'visible'));
    let count = 0;
    let minX = info.width,
      minY = info.height,
      maxX = 0,
      maxY = 0;
    for (let y = 0; y < info.height; y++)
      for (let x = 0; x < info.width; x++) {
        const offset = (y * info.width + x) * info.channels;
        if (
          ![0, 1, 2].some(
            (channel) =>
              Math.abs(data[offset + channel] - background[offset + channel]) >
              25,
          )
        )
          continue;
        count++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    expect(count).toBeGreaterThan(200);
    expect(minX).toBeGreaterThan(info.width * 0.025);
    expect(minY).toBeGreaterThan(info.height * 0.025);
    expect(maxX).toBeLessThan(info.width * 0.975);
    expect(maxY).toBeLessThan(info.height * 0.975);
  }
  await checkMargins();
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.8,
    bounds.y + bounds.height * 0.3,
    { steps: 8 },
  );
  await page.mouse.up();
  await checkMargins();
  await viewer.getByRole('button', { name: 'Ampliar trofeo' }).click();
  await expect(viewer.locator('[data-trophy-dialog]')).toBeVisible();
  await checkMargins();
  await page.setViewportSize({ width: 390, height: 844 });
  await checkMargins();
  await page.getByRole('button', { name: 'Cerrar visor ampliado' }).click();
  await checkMargins();
});
