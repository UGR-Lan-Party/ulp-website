import {
  buildTournamentFormat,
  renderTournamentFormat,
} from '../utils/tournament-format.js';

document
  .querySelectorAll<HTMLElement>('[data-format-builder]')
  .forEach((root) => {
    const select = root.querySelector<HTMLSelectElement>(
      '[data-format-capacity]',
    )!;
    const content = root.querySelector<HTMLElement>('[data-format-content]')!;
    const status = root.querySelector<HTMLElement>('[data-format-status]')!;
    let observers: ResizeObserver[] = [];
    function connect() {
      observers.forEach((observer) => observer.disconnect());
      observers = [];
      content
        .querySelectorAll<HTMLElement>('.format-bracket')
        .forEach((board) => {
          const svg = board.querySelector<SVGSVGElement>(
            '[data-format-lines]',
          )!;
          const draw = () => {
            const bounds = board.getBoundingClientRect();
            if (!bounds.width) return;
            svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
            const matches = Array.from(
              board.querySelectorAll<HTMLElement>('[data-format-match]'),
            );
            const byId = new Map(
              matches.map((item) => [item.dataset.formatMatch, item]),
            );
            svg.replaceChildren(
              ...matches.flatMap((item) => {
                const next = byId.get(item.dataset.formatNext);
                if (!next) return [];
                const a = item.getBoundingClientRect(),
                  b = next.getBoundingClientRect(),
                  x = a.right - bounds.left,
                  y = a.top + a.height / 2 - bounds.top,
                  tx = b.left - bounds.left,
                  ty = b.top + b.height / 2 - bounds.top,
                  mid = (x + tx) / 2,
                  r = Math.min(6, Math.abs(ty - y) / 2);
                const direction = Math.sign(ty - y) || 1;
                const path = document.createElementNS(
                  'http://www.w3.org/2000/svg',
                  'path',
                );
                path.setAttribute(
                  'd',
                  Math.abs(ty - y) < 1
                    ? `M${x} ${y}H${tx}`
                    : `M${x} ${y}H${mid - r}Q${mid} ${y} ${mid} ${y + r * direction}V${ty - r * direction}Q${mid} ${ty} ${mid + r} ${ty}H${tx}`,
                );
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', 'currentColor');
                path.setAttribute('stroke-opacity', '.25');
                path.setAttribute('stroke-width', '1.2');
                return [path];
              }),
            );
          };
          const observer = new ResizeObserver(draw);
          observer.observe(board);
          observers.push(observer);
          draw();
        });
    }
    select.addEventListener('change', () => {
      const model = buildTournamentFormat(
        root.dataset.formatBuilder,
        Number(select.value),
      );
      if (!model) return;
      // Only escaped HTML from the bounded, allowlisted presentation model enters the DOM.
      content.innerHTML = renderTournamentFormat(model);
      status.textContent = `Simulación actualizada: ${model.capacity} plazas.`;
      connect();
    });
    connect();
    void document.fonts.ready.then(connect);
  });
