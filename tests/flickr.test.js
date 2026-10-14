import assert from 'node:assert/strict';
import test from 'node:test';
import { selectFlickrPhotos, fetchFlickrPhotos } from '../src/utils/flickr.js';

test('Empty and malformed responses do not render images', () => {
  for (const data of [
    null,
    {},
    { stat: 'fail' },
    { stat: 'ok', photoset: { photo: [] } },
  ])
    assert.deepEqual(selectFlickrPhotos(data), []);
});
test('Only valid Flickr images matching the selection are used', () => {
  const data = {
    stat: 'ok',
    photoset: {
      photo: [
        null,
        {
          id: '1',
          url_k: 'https://live.staticflickr.com/a.jpg',
          width_k: 1200,
          height_k: 800,
        },
        { id: '2', url_k: 'javascript:alert(1)' },
        { id: '3', url_k: '' },
      ],
    },
  };
  assert.deepEqual(
    selectFlickrPhotos(data, { allowedIds: ['1'], landscape: true }),
    ['https://live.staticflickr.com/a.jpg'],
  );
  assert.deepEqual(selectFlickrPhotos(data, { allowedIds: ['other'] }), []);
});
test('Network, HTTP and JSON failures have the same empty result', async () => {
  for (const fetcher of [
    async () => {
      throw Error('offline');
    },
    async () => ({ ok: false }),
    async () => ({
      ok: true,
      json: async () => {
        throw Error('bad json');
      },
    }),
  ])
    assert.deepEqual(await fetchFlickrPhotos('album', 'user', {}, fetcher), []);
});
