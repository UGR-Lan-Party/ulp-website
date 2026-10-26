import { socialNetworks } from '../data/social-networks.js';
import { isSocialCount } from './social-statistics.js';

// Fixed public URLs only. A browser CORS failure is an unavailable counter, never zero.
export const publicSocialSources = {
  x: 'https://api.fxtwitter.com/ulpugr',
  tiktok: 'https://www.tikwm.com/api/user/info/?unique_id=ugrlanparty',
  discord: 'https://discord.com/api/v10/invites/FWW9wKZjav?with_counts=true',
  twitch: 'https://decapi.me/twitch/followcount/ugr_lan_party',
  instagram: 'https://www.instagram.com/ulpugr/',
  facebook: 'https://www.facebook.com/UGRLanParty/',
  youtube: 'https://www.youtube.com/@ugrlanparty/about',
};
export function parsePublicSocialCount(id, text) {
  let count,
    approximate = id === 'discord';
  if (id === 'x') {
    const data = JSON.parse(text);
    if (data.user?.screen_name?.toLowerCase() !== 'ulpugr')
      throw new Error('Account mismatch');
    count = data.user.followers;
  } else if (id === 'tiktok') {
    const data = JSON.parse(text);
    if (
      data.code !== 0 ||
      (
        data.data?.user?.uniqueId ?? data.data?.user?.unique_id
      )?.toLowerCase() !== 'ugrlanparty'
    )
      throw new Error('Account mismatch');
    count = data.data.stats?.followerCount ?? data.data.stats?.follower_count;
  } else if (id === 'discord') {
    const data = JSON.parse(text);
    if (data.code !== 'FWW9wKZjav') throw new Error('Invite mismatch');
    count = data.approximate_member_count;
  } else if (id === 'twitch') {
    if (!/^\d+$/.test(text.trim())) throw new Error('Invalid count');
    count = Number(text.trim());
  } else {
    // These platforms usually deny cross-origin reads. Parse only a public profile counter if allowed.
    const handle = {
      instagram: 'ulpugr',
      facebook: 'UGRLanParty',
      youtube: 'ugrlanparty',
    }[id];
    if (!handle || !text.toLowerCase().includes(handle.toLowerCase()))
      throw new Error('Account mismatch');
    const patterns =
      id === 'youtube'
        ? [/"subscriberCountText"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"<]+)"/]
        : [
            /<meta[^>]+(?:name|property)=["'](?:og:description|description)["'][^>]+content=["']([^"<>]+)["']/i,
          ];
    const value = patterns
      .map((pattern) => text.match(pattern)?.[1])
      .find(Boolean);
    const match = value?.match(
      /([\d.,]+)\s*(K|M|mil|millones)?\s*(?:followers|seguidores|subscribers|suscriptores)/i,
    );
    if (!match) throw new Error('No public counter');
    const suffix = match[2]?.toLowerCase();
    count = suffix
      ? Math.round(
          Number(match[1].replace(',', '.')) *
            (suffix === 'm' || suffix === 'millones' ? 1000000 : 1000),
        )
      : Number(match[1].replace(/[.,]/g, ''));
    approximate = !!suffix;
  }
  if (!isSocialCount(count)) throw new Error('Invalid count');
  return { count, approximate };
}
export async function fetchBrowserSocialSnapshot(
  fetcher = fetch,
  previous = new Map(),
  now = Date.now(),
) {
  const networks = await Promise.all(
    socialNetworks.map(async ({ id }) => {
      try {
        const response = await fetcher(publicSocialSources[id], {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error('Unavailable');
        const text = await response.text();
        if (text.length > 3000000) throw new Error('Response too large');
        const result = {
          id,
          ...parsePublicSocialCount(id, text),
          updatedAt: new Date(now).toISOString(),
          status: 'ok',
        };
        previous.set(id, result);
        return result;
      } catch {
        const last = previous.get(id);
        return last
          ? { ...last, status: 'stale' }
          : {
              id,
              count: null,
              updatedAt: null,
              status: 'error',
              approximate: false,
            };
      }
    }),
  );
  return { version: 1, networks };
}
