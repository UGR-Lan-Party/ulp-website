import assert from 'node:assert/strict';
import test from 'node:test';
import {
  socialNetworks,
  socialEditionTotals,
} from '../src/data/social-networks.js';
import { normalizeSocialSnapshot } from '../src/utils/social-statistics.js';
import { createSocialStats } from '../scripts/social-stats/providers.mjs';
import { createSocialServer } from '../scripts/social-stats/server.mjs';

test('Historical totals are computed from the seven rows, with missing years kept as null', () => {
  assert.deepEqual(socialEditionTotals, [2890, 1941, 1732, 1276, 1028]);
  assert.equal(
    socialNetworks.find((row) => row.id === 'discord').history[3],
    null,
  );
});

test('Concurrent visitors share a refresh, zero is valid, and failures retain the actual measurement time', async () => {
  let now = Date.parse('2026-10-21T12:00:00Z'),
    calls = 0,
    fail = false;
  const stats = createSocialStats({
    env: {},
    now: () => now,
    fetchImpl: async (url) => {
      if (!String(url).includes('discord.com'))
        throw new Error('Public profile unavailable');
      calls++;
      assert.equal(
        String(url),
        'https://discord.com/api/v10/invites/FWW9wKZjav?with_counts=true&with_expiration=false',
      );
      if (fail) throw new Error('private upstream error');
      return Response.json({
        approximate_member_count: 0,
        approximate_presence_count: 100,
      });
    },
  });
  const [first, second] = await Promise.all([
    stats.getSnapshot(),
    stats.getSnapshot(),
  ]);
  assert.equal(calls, 1);
  const discord = first.networks.find((row) => row.id === 'discord');
  assert.equal(discord.count, 0);
  assert.equal(discord.approximate, true);
  first.networks[2].count = 5000;
  assert.equal(second.networks[2].count, 0);
  assert.equal((await stats.getSnapshot()).networks[2].count, 0);
  now += 60_001;
  fail = true;
  const stale = (await stats.getSnapshot()).networks[2];
  assert.equal(stale.count, 0);
  assert.equal(stale.status, 'stale');
  assert.equal(stale.updatedAt, discord.updatedAt);
  assert.ok(!JSON.stringify(stale).includes('private'));
});

test('Only aggregate counts leave the server; malformed values are not published', async () => {
  const stats = createSocialStats({
    env: { SOCIAL_X_BEARER_TOKEN: 'server-secret' },
    fetchImpl: async (url) =>
      String(url).includes('api.x.com')
        ? Response.json({
            data: { public_metrics: { followers_count: -1 } },
            token: 'server-secret',
          })
        : Response.json({ approximate_member_count: 350 }),
  });
  const snapshot = await stats.getSnapshot();
  assert.equal(snapshot.networks.find((row) => row.id === 'x').status, 'error');
  assert.equal(
    snapshot.networks.find((row) => row.id === 'instagram').status,
    'error',
  );
  assert.ok(!JSON.stringify(snapshot).includes('server-secret'));
  const valid = normalizeSocialSnapshot(snapshot);
  assert.equal(valid[2].count, 350);
  assert.equal(valid[2].state, 'live');
  const bad = structuredClone(snapshot);
  bad.networks[2].count = '<img onerror=alert(1)>';
  assert.throws(() => normalizeSocialSnapshot(bad));
  const duplicate = structuredClone(snapshot);
  duplicate.networks.push(snapshot.networks[2]);
  assert.throws(() => normalizeSocialSnapshot(duplicate));
});

test('Future timestamps and invented live values are rejected; old successful counts are marked stale', () => {
  const now = Date.parse('2026-10-21T12:00:00Z');
  const snapshot = {
    version: 1,
    networks: socialNetworks.map(({ id }) => ({
      id,
      count: 10,
      updatedAt: new Date(now - 240_000).toISOString(),
      status: 'ok',
    })),
  };
  assert.ok(
    normalizeSocialSnapshot(snapshot, now).every(
      (row) => row.state === 'stale',
    ),
  );
  snapshot.networks[0].updatedAt = new Date(now + 300_000).toISOString();
  assert.throws(() => normalizeSocialSnapshot(snapshot, now));
});

test('The HTTP service exposes only its fixed read-only routes', async () => {
  const server = createSocialServer({
    env: {},
    fetchImpl: async () => Response.json({ approximate_member_count: 350 }),
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(base + '/api/social-stats');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).networks.length, 7);
    assert.equal(
      (await fetch(base + '/api/social-stats?url=https://example.com')).status,
      404,
    );
    assert.equal(
      (await fetch(base + '/api/social-stats', { method: 'POST' })).status,
      405,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Configured providers read their own account counters and never expose credentials', async () => {
  const env = {
    SOCIAL_X_BEARER_TOKEN: 'private-x',
    SOCIAL_INSTAGRAM_USER_ID: '123',
    SOCIAL_INSTAGRAM_ACCESS_TOKEN: 'private-ig',
    SOCIAL_META_GRAPH_VERSION: 'v24.0',
    SOCIAL_FACEBOOK_PAGE_ID: '456',
    SOCIAL_FACEBOOK_ACCESS_TOKEN: 'private-fb',
    SOCIAL_TWITCH_CLIENT_ID: 'client',
    SOCIAL_TWITCH_ACCESS_TOKEN: 'private-twitch',
    SOCIAL_TIKTOK_ACCESS_TOKEN: 'private-tiktok',
    SOCIAL_YOUTUBE_API_KEY: 'private-yt',
  };
  const stats = createSocialStats({
    env,
    fetchImpl: async (value, options) => {
      const url = new URL(value);
      assert.ok(
        [
          'api.x.com',
          'discord.com',
          'graph.instagram.com',
          'graph.facebook.com',
          'open.tiktokapis.com',
          'www.googleapis.com',
          'api.twitch.tv',
        ].includes(url.hostname),
      );
      assert.equal(options.redirect, 'error');
      if (url.hostname === 'api.x.com')
        return Response.json({
          data: { public_metrics: { followers_count: 815 } },
        });
      if (url.hostname === 'discord.com')
        return Response.json({ approximate_member_count: 413 });
      if (url.hostname === 'graph.instagram.com')
        return Response.json({ followers_count: 1200 });
      if (url.hostname === 'graph.facebook.com')
        return Response.json({ followers_count: 193 });
      if (url.hostname === 'open.tiktokapis.com')
        return Response.json({
          data: { user: { follower_count: 100 } },
          error: { code: 'ok' },
        });
      if (url.hostname === 'www.googleapis.com')
        return Response.json({
          items: [
            {
              statistics: {
                subscriberCount: '58',
                hiddenSubscriberCount: false,
              },
            },
          ],
        });
      return url.pathname === '/helix/users'
        ? Response.json({ data: [{ id: '123' }] })
        : Response.json({ total: 221 });
    },
  });
  const data = await stats.getSnapshot();
  assert.deepEqual(
    data.networks.map((row) => row.count),
    [815, 1200, 413, 221, 100, 58, 193],
  );
  assert.ok(data.networks.every((row) => row.status === 'ok'));
  assert.ok(!JSON.stringify(data).includes('private-'));
});

test('Public counters distinguish followers from following and reject unrelated profiles', async () => {
  const { parsePublicProfile, parsePublicCount, publicCount } =
    await import('../scripts/social-stats/public-providers.mjs');
  const profile =
    '<meta property="og:url" content="https://www.instagram.com/ulpugr/"><meta property="og:description" content="1,188 seguidores, 1,216 siguiendo, 79 publicaciones">';
  assert.equal(parsePublicProfile('instagram', profile).value, 1188);
  assert.throws(() =>
    parsePublicProfile('instagram', profile.replace('/ulpugr/', '/other/')),
  );
  assert.throws(() =>
    parsePublicProfile('instagram', profile.replace('seguidores', 'siguiendo')),
  );
  assert.deepEqual(parsePublicCount('1,2 mil'), {
    value: 1200,
    approximate: true,
  });
  assert.deepEqual(parsePublicCount('0'), { value: 0, approximate: false });
  assert.throws(() => parsePublicCount('Rate limit exceeded'));
  assert.equal(
    parsePublicProfile(
      'youtube',
      '<title>UGR LAN Party - YouTube</title>{"subscriberCountText":"55 suscriptores"}',
    ).value,
    55,
  );
  await assert.rejects(
    publicCount(
      'instagram',
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: 'https://example.com/' },
        }),
    ),
    /Unexpected redirect/,
  );
});

test('The public X counter validates account identity, metrics and upstream errors', async () => {
  const { parsePublicProfile } =
    await import('../scripts/social-stats/public-providers.mjs');
  const data = {
    code: 200,
    user: { screen_name: 'ulpugr', followers: 790, following: 803 },
  };
  assert.equal(parsePublicProfile('x', JSON.stringify(data)).value, 790);
  for (const invalid of [
    { ...data, code: 404 },
    { code: 200, user: { ...data.user, screen_name: 'other' } },
    { code: 200, user: { ...data.user, followers: -1 } },
  ])
    assert.throws(() => parsePublicProfile('x', JSON.stringify(invalid)));
});

test('TikTok counts belong to the verified Linktree account and never confuse likes with followers', async () => {
  const { parsePublicProfile } =
    await import('../scripts/social-stats/public-providers.mjs');
  const data = {
    code: 0,
    data: {
      user: { uniqueId: 'ugrlanparty' },
      stats: { followerCount: 96, heartCount: 1185 },
    },
  };
  assert.equal(parsePublicProfile('tiktok', JSON.stringify(data)).value, 96);
  assert.throws(() =>
    parsePublicProfile('tiktok', JSON.stringify({ ...data, code: -1 })),
  );
  data.data.user.uniqueId = 'other';
  assert.throws(() => parsePublicProfile('tiktok', JSON.stringify(data)));
});
