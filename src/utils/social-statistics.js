import { socialNetworks } from '../data/social-networks.js';

export const SOCIAL_REFRESH_MS = 60_000;
export const isSocialCount = (value) =>
  Number.isSafeInteger(value) && value >= 0 && value <= 10_000_000_000;

export function normalizeSocialSnapshot(payload, now = Date.now()) {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.networks))
    throw new Error('Invalid social statistics');
  return socialNetworks.map(({ id }) => {
    const matches = payload.networks.filter((item) => item?.id === id);
    if (matches.length !== 1) throw new Error('Missing or duplicate network');
    const source = matches[0];
    if (!['ok', 'stale', 'unconfigured', 'error'].includes(source.status))
      throw new Error('Invalid status');
    if (
      source.count === null &&
      ['unconfigured', 'error'].includes(source.status)
    )
      return {
        id,
        count: null,
        updatedAt: null,
        state: source.status,
        approximate: false,
      };
    const timestamp = Date.parse(source.updatedAt);
    if (
      !isSocialCount(source.count) ||
      !Number.isFinite(timestamp) ||
      timestamp < 0 ||
      timestamp > now + 60_000
    )
      throw new Error('Invalid counter');
    return {
      id,
      count: source.count,
      updatedAt: new Date(timestamp).toISOString(),
      state:
        source.status === 'ok' && now - timestamp <= SOCIAL_REFRESH_MS * 3
          ? 'live'
          : 'stale',
      approximate: source.approximate === true,
    };
  });
}
