export function overlayText(value, fallback = '', limit = 36) {
  if (typeof value !== 'string') return fallback;
  const text = value
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(text).slice(0, limit).join('') || fallback;
}

export function overlayScore(value) {
  const number =
    typeof value === 'string' || typeof value === 'number'
      ? Number(value)
      : NaN;
  return Number.isFinite(number)
    ? Math.max(0, Math.min(99, Math.trunc(number)))
    : 0;
}

export function overlaySettings(input = {}) {
  input =
    input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return {
    teamA: overlayText(input.teamA, 'Equipo A'),
    teamB: overlayText(input.teamB, 'Equipo B'),
    scoreA: overlayScore(input.scoreA),
    scoreB: overlayScore(input.scoreB),
    player: overlayText(input.player, 'UGR LAN Party', 48),
    caption: overlayText(input.caption, 'En directo', 32),
    mode: ['scoreboard', 'caption', 'both'].includes(input.mode)
      ? input.mode
      : 'both',
  };
}

function panel(ctx, x, y, w, h) {
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, '#006471');
  gradient.addColorStop(1, '#063349');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 5);
  ctx.fill();
  ctx.fillStyle = '#80d5c6';
  ctx.fillRect(x + 10, y, w - 20, 2);
}

function text(
  ctx,
  content,
  x,
  y,
  maxWidth,
  size,
  align = 'left',
  weight = 650,
) {
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  let label = content;
  ctx.font = `${weight} ${size}px "Inter Variable", Arial, sans-serif`;
  while (ctx.measureText(label).width > maxWidth && size > 18) {
    size--;
    ctx.font = `${weight} ${size}px "Inter Variable", Arial, sans-serif`;
  }
  if (ctx.measureText(label).width > maxWidth) {
    while (label && ctx.measureText(label + '…').width > maxWidth)
      label = Array.from(label).slice(0, -1).join('');
    label += '…';
  }
  ctx.fillStyle = '#f5f0e6';
  ctx.fillText(label, x, y);
}

/** Draws only the personalised layers. The untouched centre remains transparent. */
export function drawOverlay(ctx, settings) {
  const s = overlaySettings(settings);
  ctx.clearRect(0, 0, 1920, 1080);
  if (s.mode !== 'caption') {
    panel(ctx, 343, 15, 460, 55);
    panel(ctx, 1117, 15, 460, 55);
    panel(ctx, 838, 15, 244, 55);
    text(ctx, s.teamA, 573, 43, 420, 27, 'center');
    text(ctx, s.teamB, 1347, 43, 420, 27, 'center');
    text(ctx, `${s.scoreA} — ${s.scoreB}`, 960, 43, 220, 30, 'center', 750);
  }
  if (s.mode !== 'scoreboard') {
    const gradient = ctx.createLinearGradient(116, 856, 836, 956);
    gradient.addColorStop(0, '#006471');
    gradient.addColorStop(1, '#063349');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(140, 856);
    ctx.lineTo(836, 856);
    ctx.lineTo(812, 956);
    ctx.lineTo(116, 956);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#80d5c6';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(
      ctx,
      s.caption.toLocaleUpperCase('es'),
      158,
      879,
      620,
      18,
      'left',
      550,
    );
    text(ctx, s.player, 158, 922, 620, 34, 'left', 750);
  }
}
