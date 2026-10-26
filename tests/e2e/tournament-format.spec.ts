import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('https://**', (route) =>
    route.fulfill({ status: 200, body: '' }),
  );
});
test('LoL adjusts groups and playoffs without assigning registered teams or altering their rosters', async ({
  page,
}) => {
  await page.goto('/actividades/league-of-legends/');
  const builder = page.locator('[data-format-builder]');
  await expect(
    builder
      .locator('[data-format-kind="groups"]')
      .first()
      .locator('.format-pool'),
  ).toHaveCount(3);
  await expect(builder).toContainText('Repesca entre segundos');
  await builder.locator('[data-format-capacity]').selectOption('16');
  await expect(builder.locator('[data-format-kind="groups"]')).toHaveCount(1);
  await expect(
    builder.locator('[data-format-kind="groups"] .format-pool'),
  ).toHaveCount(4);
  await expect(builder.locator('.format-match b').first()).toHaveText('TBD');
  await expect(builder.locator('[data-format-status]')).toContainText(
    '16 plazas',
  );
  await expect(page.locator('.tournament-roster')).toContainText(
    'no determina los cruces',
  );
  const before = await builder.locator('[data-format-content]').innerHTML();
  await builder
    .locator('[data-format-capacity]')
    .evaluate((select: HTMLSelectElement) => {
      const option = new Option(
        '<img src=x onerror=alert(1)>',
        '<img src=x onerror=alert(1)>',
      );
      select.add(option);
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
  expect(await builder.locator('[data-format-content]').innerHTML()).toBe(
    before,
  );
  await expect(builder.locator('img')).toHaveCount(0);
});
test('Smash shows anonymous dynamic brackets with connections between rounds', async ({
  page,
}) => {
  await page.goto('/actividades/smash/');
  await expect(page.locator('[data-match-id]')).toHaveCount(0);
  await page.locator('[data-format-capacity]').selectOption('24');
  await expect(page.locator('[data-match-id]')).toHaveCount(0);
  await expect(page.locator('[data-format-kind="bracket"]')).toHaveCount(3);
  await expect(page.locator('[data-format-lines] path').first()).toBeAttached();
  const directions = await page
    .locator('[data-format-lines] path')
    .evaluateAll((paths) =>
      paths.map((p) => {
        const el = p as SVGPathElement;
        return (
          el.getPointAtLength(el.getTotalLength()).x > el.getPointAtLength(0).x
        );
      }),
    );
  expect(directions.every(Boolean)).toBe(true);
});
test('Brawl brackets, odd groups and scoring challenges stay contained on mobile and in dark mode', async ({
  page,
}) => {
  await page.goto('/actividades/brawl-stars/');
  await page.locator('[data-format-capacity]').selectOption('18');
  await expect(
    page.locator('[data-format-kind="groups"] .format-pool'),
  ).toHaveCount(5);
  await page.locator('.format-pool summary').first().click();
  await expect(page.locator('.format-pool').first()).toContainText('Jornada');
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto('/actividades/tetris/');
  await expect(page.locator('[data-format-kind="ranking"]')).toHaveCount(1);
  await page.locator('[data-format-capacity]').selectOption('24');
  await page.locator('.format-ranking summary').click();
  await expect(page.locator('.format-ranking li')).toHaveCount(24);
  await page.goto('/actividades/paella/');
  await expect(page.locator('[data-format-builder]')).toHaveCount(0);
});

test('Bracket cards, sticky round headings and connectors survive resizing, scrolling and capacity changes', async ({
  page,
}) => {
  await page.goto('/actividades/smash/');
  const builder = page.locator('[data-format-builder]');
  const phase = builder.locator('[data-format-kind="bracket"]').first();
  const scroll = phase.locator('.format-scroll');
  const board = phase.locator('.format-bracket');
  for (const capacity of ['8', '24']) {
    await builder.locator('[data-format-capacity]').selectOption(capacity);
    await expect(
      board.locator('.tournament-round-heading').last(),
    ).toContainText('Final');
    await expect(board.locator('.tournament-round-heading').last()).toHaveClass(
      /is-final/,
    );
    const match = board.locator('.tournament-match').first();
    await expect(match.locator('.tournament-team')).toHaveCount(2);
    await expect(match.locator('.tournament-score')).toHaveText(['—', '—']);
    await expect(match.locator('header')).toContainText('Encuentro 01');
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await scroll.scrollIntoViewIfNeeded();
      await expect
        .poll(async () =>
          board.evaluate((el) => {
            const bounds = el.getBoundingClientRect();
            const byId = new Map(
              Array.from(
                el.querySelectorAll<HTMLElement>('[data-format-match]'),
              ).map((m) => [m.dataset.formatMatch, m]),
            );
            const links = Array.from(byId.values()).flatMap((m) => {
              const next = byId.get(m.dataset.formatNext);
              return next ? [[m, next]] : [];
            });
            const paths = Array.from(
              el.querySelectorAll<SVGPathElement>('svg path'),
            );
            return (
              links.length > 0 &&
              links.length === paths.length &&
              links.every(([a, b], i) => {
                const source = a.getBoundingClientRect(),
                  target = b.getBoundingClientRect();
                const start = paths[i].getPointAtLength(0),
                  end = paths[i].getPointAtLength(paths[i].getTotalLength());
                return (
                  Math.abs(start.x - (source.right - bounds.left)) < 1 &&
                  Math.abs(
                    start.y - (source.top + source.height / 2 - bounds.top),
                  ) < 1 &&
                  Math.abs(end.x - (target.left - bounds.left)) < 1 &&
                  Math.abs(
                    end.y - (target.top + target.height / 2 - bounds.top),
                  ) < 1
                );
              })
            );
          }),
        )
        .toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await scroll.focus();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => scroll.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await scroll.evaluate((el) => {
    el.scrollTop = 150;
  });
  const top = await scroll.boundingBox();
  const heading = await board
    .locator('.tournament-round-heading')
    .first()
    .boundingBox();
  const padding = await scroll.evaluate((el) =>
    parseFloat(getComputedStyle(el).paddingTop),
  );
  expect(Math.abs(heading!.y - top!.y - padding)).toBeLessThan(2);
  expect(await scroll.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
});
