import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});

for (const route of [
  '/',
  '/actividades/',
  '/participan/',
  '/contacto/',
  '/blog/',
  '/blog/havefungamers/',
  '/info/ediciones_anteriores/',
  '/info/about/',
  '/info/localizacion/',
  '/info/preguntas_frecuentes/',
  '/info/preguntas_frecuentes/2/',
  '/info/preguntas_frecuentes/3/',
  '/info/aviso_legal/',
]) {
  test(`La propuesta conserva el contenido accesible y cabe en 390 px: ${route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.linktree-card')).toHaveCount(
      route === '/' ? 1 : 0,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const links = page.locator('a[href="javascript:void(0)"]');
    expect(await links.count()).toBe(0);
    expect(errors).toEqual([]);
  });
}

test('El footer conserva las siete redes con iconos y las noticias no anidan controles interactivos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/blog/');
  const footer = page.locator('footer');
  const links = footer
    .getByRole('navigation', { name: 'Redes sociales de ULP' })
    .getByRole('link');
  await expect(links).toHaveCount(7);
  for (const link of await links.all())
    await expect(link.locator('svg')).toHaveCount(1);
  await expect(page.locator('.news-card').first()).toBeVisible();
  await expect(page.locator('.news-card a button, .news-card a a')).toHaveCount(
    0,
  );
  const articleLink = page.locator('.news-card a').first();
  await articleLink.click();
  await expect(page.locator('article h1')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Descargar imagen original' }),
  ).toHaveAttribute('download', '');
  await expect(page.locator('.article-body')).not.toBeEmpty();
});

test('Los logos de Participan conservan contraste sobre su superficie clara en ambos temas', async ({
  page,
}) => {
  await page.goto('/participan/');
  const names = [
    'Nacon España',
    'DEIIT',
    'Mars Gaming',
    'The Game Kitchen',
    'Iction Games',
    'Hackiit',
  ];
  for (let theme = 0; theme < 2; theme++) {
    for (const name of names) {
      await expect(
        page.locator(`[data-partner-card] [data-partner-logo="${name}"]`),
      ).toHaveCSS('filter', 'none');
    }
    await page.getByRole('button', { name: 'Modo oscuro' }).click();
  }
});

test('El archivo permite saltar de edición y leer su historia sin JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.goto('/info/ediciones_anteriores/');
    const years = page.getByRole('navigation', {
      name: 'Cronograma de ediciones ULP',
    });
    await expect(years.getByRole('link')).toHaveCount(8);
    await years.locator('a[href="#edicion-2016"]').click();
    await expect(page).toHaveURL(/#edicion-2016$/);
    const firstEdition = page.locator('#edicion-2016');
    await expect(
      firstEdition.getByRole('heading', { name: 'Primera Edición' }),
    ).toBeVisible();
    const details = firstEdition.locator('details');
    if (await details.count()) {
      await expect(details).not.toHaveAttribute('open', '');
      await details.locator('summary').click();
      await expect(details).toHaveAttribute('open', '');
    }
    await expect(firstEdition.locator('.archive-history')).toHaveCount(2);
    for (const paragraph of await firstEdition
      .locator('.archive-history')
      .all())
      await expect(paragraph).toBeVisible();
    await expect(
      firstEdition.getByRole('link', { name: 'Ver web original' }),
    ).toHaveAttribute('href', 'https://lanpartypiloto.wixsite.com/lpp-etsiit');
    await expect(
      page.getByRole('link', { name: 'Ver álbum completo', exact: true }),
    ).toHaveCount(7);
    await expect(
      page.getByRole('link', { name: 'Ver programa de 2026' }),
    ).toHaveAttribute('href', '/horarios');
  } finally {
    await context.close();
  }
});

test('Las preguntas se recorren de seis en seis sin JavaScript ni duplicados', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
  const page = await context.newPage();
  try {
    await page.goto('/info/preguntas_frecuentes/');
    const titles: string[] = [];
    for (const [index, count] of [6, 6, 4].entries()) {
      const questions = page.locator('.faq-list > details');
      await expect(questions).toHaveCount(count);
      const pagination = page.getByRole('navigation', {
        name: 'Páginas de preguntas frecuentes',
      });
      await expect(
        pagination.getByRole('link', {
          name: `Página ${index + 1}`,
          exact: true,
        }),
      ).toHaveAttribute('aria-current', 'page');
      titles.push(...(await questions.locator('summary').allTextContents()));
      await questions.first().locator('summary').click();
      await expect(questions.first().locator('p')).toBeVisible();
      if (index < 2)
        await pagination
          .getByRole('link', { name: `Página ${index + 2}`, exact: true })
          .click();
    }
    expect(new Set(titles).size).toBe(16);
    await page.reload();
    await expect(page.locator('.faq-list > details')).toHaveCount(4);
  } finally {
    await context.close();
  }
});

test('Inscripciones lleva al catálogo con el orden de torneos solicitado', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(
    page
      .locator('#home')
      .getByRole('link', { name: 'Encuesta Inicial', exact: true }),
  ).toHaveAttribute('href', 'https://forms.gle/32zwkMrrx2UrLdwx9');
  await page
    .getByRole('navigation', { name: 'Principal', exact: true })
    .getByRole('link', { name: 'Inscripciones', exact: true })
    .click();
  await expect(page).toHaveURL(/\/actividades\/?#competiciones$/);
  await expect(page.locator('#competiciones h2')).toBeInViewport();
  await expect(page.locator('#competiciones .activity-tile h3')).toHaveText([
    'Mario Kart World',
    'Clash Royale',
    'Super Smash Bros Ultimate',
    'Wii Sports Tenis',
    'League of Legends',
    'Minecraft',
    'Wii Sports Bolos',
    'Ajedrez',
    'Brawl Stars',
    'Rocket League',
    'Futbolín',
    'Ping Pong',
    'Hacking Ético',
  ]);
});
