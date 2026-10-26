import { test, expect } from '@playwright/test';
for (const width of [390, 1280])
  test(`Contact prepares a local draft and supports copying without a clipboard API at ${width}px`, async ({
    page,
  }) => {
    await page.route('https://**', (route) =>
      route.fulfill({ status: 200, body: '' }),
    );
    await page.addInitScript(() =>
      Object.defineProperty(Navigator.prototype, 'clipboard', {
        get: () => undefined,
        configurable: true,
      }),
    );
    await page.goto('/contacto/');
    const form = page.getByRole('form', {
      name: 'Preparar correo de contacto',
    });
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.evaluate(() =>
      document.addEventListener(
        'click',
        (event) => {
          const a = (event.target as HTMLElement).closest('a');
          if (a?.protocol === 'mailto:') event.preventDefault();
        },
        true,
      ),
    );
    await form.getByLabel('Nombre', { exact: true }).fill('María Prueba ULP');
    await form
      .getByLabel('Tu correo', { exact: true })
      .fill('maria+ulp@example.org');
    await form
      .getByLabel('Asunto', { exact: true })
      .fill('Conciertos & actividades');
    await form
      .getByLabel('Mensaje', { exact: true })
      .fill('Hola, ULP.\n¿Hablamos de colaborar?');
    await form
      .getByRole('button', { name: 'Abrir correo', exact: false })
      .click();
    const draft = form.locator('[data-contact-draft]');
    await expect(draft).toBeVisible();
    const url = new URL((await draft.getAttribute('href'))!);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('ulp@ugr.es');
    expect(url.searchParams.get('subject')).toBe(
      'Contacto ULP · Conciertos & actividades',
    );
    expect(url.searchParams.get('body')).toContain('maria+ulp@example.org');
    await expect(form.getByRole('status')).toContainText('pulsa enviar allí');
    await form
      .getByRole('button', { name: 'Copiar mensaje', exact: true })
      .click();
    const fallback = form.getByRole('textbox', {
      name: 'Mensaje preparado para copiar',
    });
    await expect(fallback).toBeVisible();
    expect(await fallback.inputValue()).toContain('Para: ulp@ugr.es');
    await form.getByLabel('Asunto', { exact: true }).fill('Otra idea');
    await expect(draft).toBeHidden();
    await expect(fallback).toBeHidden();
    expect(
      requests.some(
        (url) => url.includes('Mar%C3%ADa') || url.includes('maria%2Bulp'),
      ),
    ).toBe(false);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
