import { isSocialCount } from '../../src/utils/social-statistics.js';

export const publicUrls = {
  x: 'https://api.fxtwitter.com/ulpugr',
  tiktok: 'https://www.tikwm.com/api/user/info/?unique_id=ugrlanparty',
  instagram: 'https://www.instagram.com/ulpugr/',
  facebook: 'https://www.facebook.com/UGRLanParty/',
  youtube: 'https://www.youtube.com/@ugrlanparty/about?cbrd=1&ucbcb=1',
  twitch: 'https://decapi.me/twitch/followcount/ugr_lan_party',
};

export function parsePublicCount(text) {
  const match = text
    .trim()
    .match(/^(\d[\d.,\s\u00a0]*)(?:\s*(mil|k|m|millones?))?$/i);
  if (!match) throw new Error('Missing public count');
  const suffix = match[2]?.toLowerCase();
  const number = suffix
    ? Number(match[1].replace(/\s/g, '').replace(',', '.'))
    : Number(match[1].replace(/[.,\s]/g, ''));
  const value = Math.round(
    number * (suffix ? (/^(m$|millon)/.test(suffix) ? 1e6 : 1e3) : 1),
  );
  if (!isSocialCount(value)) throw new Error('Invalid public count');
  return { value, approximate: !!suffix };
}

function decode(text) {
  return text
    .replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => {
      const n =
        code[0].toLowerCase() === 'x'
          ? parseInt(code.slice(1), 16)
          : Number(code);
      return n <= 0x10ffff ? String.fromCodePoint(n) : '';
    })
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

function meta(html, name) {
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = Object.fromEntries(
      [...tag[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map((m) => [
        m[1].toLowerCase(),
        decode(m[3]),
      ]),
    );
    if (attributes.property === name || attributes.name === name)
      return attributes.content || '';
  }
  return '';
}

export function parsePublicProfile(id, html) {
  if (id === 'tiktok') {
    const data = JSON.parse(html);
    if (
      data.code !== 0 ||
      data.data?.user?.uniqueId?.toLowerCase() !== 'ugrlanparty' ||
      !isSocialCount(data.data?.stats?.followerCount)
    )
      throw new Error('Invalid TikTok profile');
    return { value: data.data.stats.followerCount, approximate: false };
  }
  if (id === 'x') {
    const data = JSON.parse(html);
    if (
      data.code !== 200 ||
      data.user?.screen_name?.toLowerCase() !== 'ulpugr' ||
      !isSocialCount(data.user?.followers)
    )
      throw new Error('Invalid X profile');
    return { value: data.user.followers, approximate: false };
  }
  if (id === 'twitch') return parsePublicCount(html);
  if (id === 'youtube') {
    if (!/<title>UGR LAN Party - YouTube<\/title>/i.test(html))
      throw new Error('Unexpected channel');
    const data = html.replace(/\\"/g, '"');
    const counts = [
      ...data.matchAll(/"subscriberCountText"\s*:\s*("(?:[^"\\]|\\.)*")/g),
    ];
    if (counts.length !== 1) throw new Error('Ambiguous subscribers');
    const label = JSON.parse(counts[0][1]);
    const match = label.match(
      /^([\d.,\s]+(?:mil|k|m|millones?)?)\s+(?:suscriptores?|subscribers?)$/i,
    );
    if (!match) throw new Error('Missing subscribers');
    return parsePublicCount(match[1]);
  }
  if (
    meta(html, 'og:url').replace(/\/$/, '').toLowerCase() !==
    publicUrls[id].replace(/\/$/, '').toLowerCase()
  )
    throw new Error('Unexpected profile');
  const match = meta(html, 'og:description').match(
    /(?:^|[^\d.,])([\d][\d.,\s]*(?:mil|k|m|millones?)?)\s+(?:seguidores|followers)\b/i,
  );
  if (!match) throw new Error('Missing followers');
  return parsePublicCount(match[1]);
}

export async function publicCount(id, fetchImpl) {
  let url = new URL(publicUrls[id]);
  const original = new URL(url);
  const signal = AbortSignal.timeout(8000);
  for (let redirects = 0; redirects < 4; redirects++) {
    const response = await fetchImpl(url, {
      redirect: 'manual',
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,text/plain;q=0.9',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      url = new URL(response.headers.get('location'), url);
      if (
        url.origin !== original.origin ||
        url.pathname !== original.pathname ||
        url.username ||
        url.password
      )
        throw new Error('Unexpected redirect');
      continue;
    }
    if (!response.ok) throw new Error('Public profile unavailable');
    const reader = response.body.getReader(),
      chunks = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 3_000_000) throw new Error('Public profile too large');
        chunks.push(value);
      }
      return parsePublicProfile(id, Buffer.concat(chunks).toString('utf8'));
    } finally {
      await reader.cancel().catch(() => {});
    }
  }
  throw new Error('Too many redirects');
}
