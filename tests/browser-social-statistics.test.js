import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePublicSocialCount,
  fetchBrowserSocialSnapshot,
} from '../src/utils/browser-social-statistics.js';
test('public responses validate identity and preserve legitimate zero', () => {
  assert.equal(
    parsePublicSocialCount(
      'x',
      JSON.stringify({ user: { screen_name: 'ulpugr', followers: 0 } }),
    ).count,
    0,
  );
  assert.equal(
    parsePublicSocialCount(
      'tiktok',
      JSON.stringify({
        code: 0,
        data: {
          user: { uniqueId: 'ugrlanparty' },
          stats: { followerCount: 96 },
        },
      }),
    ).count,
    96,
  );
  assert.throws(() =>
    parsePublicSocialCount(
      'x',
      JSON.stringify({ user: { screen_name: 'other', followers: 100 } }),
    ),
  );
  assert.throws(() => parsePublicSocialCount('twitch', '<html>100</html>'));
  assert.throws(() => parsePublicSocialCount('twitch', '-3'));
});
test('independent browser GET failures preserve last good timestamps without affecting history', async () => {
  const previous = new Map();
  const now = Date.now();
  let fail = false;
  const fetcher = async (url, opts) => {
    assert.equal(opts.method, 'GET');
    assert.equal(opts.credentials, 'omit');
    assert.ok(url.startsWith('https://'));
    assert.ok(!url.includes('api/social-stats'));
    if (!url.includes('fxtwitter') || fail) throw new Error('CORS');
    return {
      ok: true,
      text: async () =>
        JSON.stringify({ user: { screen_name: 'ulpugr', followers: 789 } }),
    };
  };
  const first = await fetchBrowserSocialSnapshot(fetcher, previous, now);
  assert.equal(first.networks[0].count, 789);
  assert.equal(first.networks[1].count, null);
  fail = true;
  const second = await fetchBrowserSocialSnapshot(
    fetcher,
    previous,
    now + 60000,
  );
  assert.equal(second.networks[0].status, 'stale');
  assert.equal(second.networks[0].updatedAt, first.networks[0].updatedAt);
});
