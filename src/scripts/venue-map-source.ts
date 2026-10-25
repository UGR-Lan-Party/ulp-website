export function initMapSourceTools() {
  const page = document.querySelector<HTMLElement>('[data-map-page]');
  if (!page) return;
  const link = page.querySelector<HTMLAnchorElement>('[data-map-fullscreen]');
  const button = page.querySelector<HTMLButtonElement>(
    '[data-map-copy-source]',
  );
  if (!link || !button) return;
  function sourceUrl(controls = false) {
    const url = new URL('/info/mapa/obs/', location.origin);
    const map = page!.querySelector<HTMLElement>('[data-venue-map]')!;
    url.searchParams.set('plano', map.dataset.venuePlan || 'recinto');
    url.searchParams.set('orientacion', map.dataset.orientation || '0');
    if (map.dataset.campusVersion === 'modern')
      url.searchParams.set('vista', 'moderna');
    if (map.dataset.routeOrigin && map.dataset.routeDestination) {
      url.searchParams.set('desde', map.dataset.routeOrigin);
      url.searchParams.set('hasta', map.dataset.routeDestination);
      url.searchParams.set('tramo', map.dataset.routeStep || '0');
    }
    if (controls) url.searchParams.set('controles', '1');
    return url.href;
  }
  const sync = () => {
    link.href = sourceUrl(true);
  };
  const map = page.querySelector('[data-venue-map]')!;
  new MutationObserver(sync).observe(map, {
    attributes: true,
    attributeFilter: [
      'data-venue-plan',
      'data-orientation',
      'data-campus-version',
      'data-route-origin',
      'data-route-destination',
      'data-route-step',
    ],
  });
  sync();
  button.addEventListener('click', async () => {
    const status = page!.querySelector<HTMLElement>(
      '[data-map-source-status]',
    )!;
    const fallback = page!.querySelector<HTMLInputElement>(
      '[data-map-source-fallback]',
    )!;
    try {
      await navigator.clipboard.writeText(sourceUrl());
      fallback.hidden = true;
      status.textContent =
        'Enlace copiado. Úsalo como fuente Navegador (1920 × 1080) en OBS.';
    } catch {
      fallback.value = sourceUrl();
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      status.textContent = 'Copia este enlace para la fuente Navegador de OBS.';
    }
  });
}
