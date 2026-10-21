document
  .querySelectorAll<HTMLDetailsElement>('[data-bracket]')
  .forEach((root) => {
    const board = root.querySelector<HTMLElement>('.bracket-board')!;
    const svg = root.querySelector<SVGSVGElement>('[data-bracket-lines]')!;
    const matches = Array.from(
      root.querySelectorAll<HTMLElement>('[data-match-id]'),
    );
    const byId = new Map(
      matches.map((match) => [match.dataset.matchId, match]),
    );
    function draw() {
      if (!root.open || !board.offsetWidth) return;
      svg.setAttribute(
        'viewBox',
        `0 0 ${board.offsetWidth} ${board.offsetHeight}`,
      );
      const bounds = board.getBoundingClientRect();
      const paths = matches.flatMap((match) => {
        const next = byId.get(match.dataset.nextMatch);
        if (!next) return [];
        const source = match.getBoundingClientRect(),
          target = next.getBoundingClientRect();
        const x = source.right - bounds.left;
        const y = source.top + source.height / 2 - bounds.top;
        const targetX = target.left - bounds.left;
        const targetY = target.top + target.height / 2 - bounds.top;
        const mid = (x + targetX) / 2;
        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path',
        );
        path.setAttribute(
          'd',
          `M${x} ${y}C${mid} ${y} ${mid} ${targetY} ${targetX} ${targetY}`,
        );
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', '.22');
        return [path];
      });
      svg.replaceChildren(...paths);
    }
    new ResizeObserver(draw).observe(board);
    root.addEventListener('toggle', draw);
    void document.fonts.ready.then(draw);
    draw();
  });

export {};
