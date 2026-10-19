export function getLolStatsUrl(riotId) {
  if (typeof riotId !== 'string') return null;
  const match = /^([^#@\r\n]+)#([a-z0-9]{3,5})$/i.exec(riotId.trim());
  if (!match || !match[1].trim()) return null;
  return `https://op.gg/lol/summoners/euw/${encodeURIComponent(match[1].trim())}-${encodeURIComponent(match[2])}`;
}
