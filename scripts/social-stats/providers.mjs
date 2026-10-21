import { publicCount, publicUrls } from './public-providers.mjs';
import { socialNetworks } from '../../src/data/social-networks.js';
import {
  isSocialCount,
  SOCIAL_REFRESH_MS,
} from '../../src/utils/social-statistics.js';

const required = {
  x: ['SOCIAL_X_BEARER_TOKEN'],
  instagram: [
    'SOCIAL_INSTAGRAM_USER_ID',
    'SOCIAL_INSTAGRAM_ACCESS_TOKEN',
    'SOCIAL_META_GRAPH_VERSION',
  ],
  discord: [],
  twitch: ['SOCIAL_TWITCH_CLIENT_ID', 'SOCIAL_TWITCH_ACCESS_TOKEN'],
  tiktok: ['SOCIAL_TIKTOK_ACCESS_TOKEN'],
  youtube: ['SOCIAL_YOUTUBE_API_KEY'],
  facebook: [
    'SOCIAL_FACEBOOK_PAGE_ID',
    'SOCIAL_FACEBOOK_ACCESS_TOKEN',
    'SOCIAL_META_GRAPH_VERSION',
  ],
};

export function createSocialStats({
  env = process.env,
  fetchImpl = fetch,
  now = Date.now,
  interval = SOCIAL_REFRESH_MS,
} = {}) {
  const previous = new Map();
  let snapshot,
    attemptedAt = -Infinity,
    pending,
    twitchId;
  async function json(url, headers = {}) {
    const response = await fetchImpl(url, {
      headers: { Accept: 'application/json', ...headers },
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error('Platform request failed');
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > 131072) throw new Error('Platform response too large');
        chunks.push(value);
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } finally {
      await reader.cancel().catch(() => {});
    }
  }
  const auth = (token) => ({ Authorization: `Bearer ${token}` });
  function identifier(value) {
    if (!/^\d{1,32}$/.test(value || '')) throw new Error('Invalid account ID');
    return value;
  }
  function metaVersion() {
    const version = env.SOCIAL_META_GRAPH_VERSION;
    if (!/^v\d{1,2}\.0$/.test(version || ''))
      throw new Error('Invalid API version');
    return version;
  }
  async function count(id) {
    switch (id) {
      case 'discord': {
        const data = await json(
          'https://discord.com/api/v10/invites/FWW9wKZjav?with_counts=true&with_expiration=false',
        );
        return { value: data.approximate_member_count, approximate: true };
      }
      case 'x': {
        const data = await json(
          'https://api.x.com/2/users/by/username/ulpugr?user.fields=public_metrics',
          auth(env.SOCIAL_X_BEARER_TOKEN),
        );
        return { value: data.data?.public_metrics?.followers_count };
      }
      case 'instagram': {
        // Instagram professional account with Instagram Login and its own token.
        const data = await json(
          `https://graph.instagram.com/${metaVersion()}/${identifier(env.SOCIAL_INSTAGRAM_USER_ID)}?fields=followers_count`,
          auth(env.SOCIAL_INSTAGRAM_ACCESS_TOKEN),
        );
        return { value: data.followers_count };
      }
      case 'facebook': {
        const data = await json(
          `https://graph.facebook.com/${metaVersion()}/${identifier(env.SOCIAL_FACEBOOK_PAGE_ID)}?fields=followers_count`,
          auth(env.SOCIAL_FACEBOOK_ACCESS_TOKEN),
        );
        return { value: data.followers_count };
      }
      case 'tiktok': {
        const data = await json(
          'https://open.tiktokapis.com/v2/user/info/?fields=follower_count',
          auth(env.SOCIAL_TIKTOK_ACCESS_TOKEN),
        );
        if (data.error?.code !== 'ok') throw new Error('TikTok unavailable');
        return { value: data.data?.user?.follower_count };
      }
      case 'youtube': {
        const url = new URL('https://www.googleapis.com/youtube/v3/channels');
        url.search = new URLSearchParams({
          part: 'statistics',
          forHandle: '@ugrlanparty',
          key: env.SOCIAL_YOUTUBE_API_KEY,
        }).toString();
        const data = await json(url);
        const stats = data.items?.[0]?.statistics;
        if (
          stats?.hiddenSubscriberCount ||
          !/^\d+$/.test(stats?.subscriberCount || '')
        )
          throw new Error('Hidden subscribers');
        return {
          value: Number(stats.subscriberCount),
          approximate: Number(stats.subscriberCount) >= 1000,
        };
      }
      case 'twitch': {
        const headers = {
          ...auth(env.SOCIAL_TWITCH_ACCESS_TOKEN),
          'Client-Id': env.SOCIAL_TWITCH_CLIENT_ID,
        };
        if (!twitchId) {
          const data = await json(
            'https://api.twitch.tv/helix/users?login=ugr_lan_party',
            headers,
          );
          twitchId = identifier(data.data?.[0]?.id);
        }
        const data = await json(
          `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${twitchId}&first=1`,
          headers,
        );
        return { value: data.total };
      }
    }
    throw new Error('Unknown platform');
  }
  async function refresh() {
    const networks = await Promise.all(
      socialNetworks.map(async ({ id }) => {
        const configured = required[id].every((key) => !!env[key]);
        if (!configured && !publicUrls[id])
          return { id, count: null, updatedAt: null, status: 'unconfigured' };
        try {
          const result = configured
            ? await count(id)
            : await publicCount(id, fetchImpl);
          if (!isSocialCount(result.value)) throw new Error('Invalid count');
          const record = {
            id,
            count: result.value,
            updatedAt: new Date(now()).toISOString(),
            status: 'ok',
            approximate: result.approximate === true,
          };
          previous.set(id, record);
          return record;
        } catch {
          const saved = previous.get(id);
          return saved
            ? { ...saved, status: 'stale' }
            : { id, count: null, updatedAt: null, status: 'error' };
        }
      }),
    );
    snapshot = {
      version: 1,
      checkedAt: new Date(now()).toISOString(),
      networks,
    };
    return snapshot;
  }
  return {
    async getSnapshot() {
      if (pending) return structuredClone(await pending);
      if (snapshot && now() - attemptedAt < interval)
        return structuredClone(snapshot);
      attemptedAt = now();
      pending = refresh();
      try {
        return structuredClone(await pending);
      } finally {
        pending = undefined;
      }
    },
  };
}
