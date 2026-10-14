const API_KEY = '4f8fd63b2a81e73b7fa5425eb902e2b9';
const requests = new Map();

export function selectFlickrPhotos(
  data,
  { allowedIds, landscape = false } = {},
) {
  if (data?.stat !== 'ok' || !Array.isArray(data?.photoset?.photo)) return [];
  return data.photoset.photo.flatMap((photo) => {
    if (!photo || (allowedIds && !allowedIds.includes(photo.id))) return [];
    if (landscape && !(Number(photo.width_k) > Number(photo.height_k)))
      return [];
    const source = photo.url_k || photo.url_h || photo.url_b || photo.url_c;
    try {
      const url = new URL(source);
      return url.protocol === 'https:' &&
        url.hostname.endsWith('.staticflickr.com')
        ? [url.href]
        : [];
    } catch {
      return [];
    }
  });
}

export async function fetchFlickrPhotos(
  albumId,
  userId,
  options = {},
  fetcher = fetch,
) {
  if (process.env.ULP_FLICKR_OFFLINE === '1') return [];
  const parameters = new URLSearchParams({
    method: 'flickr.photosets.getPhotos',
    api_key: API_KEY,
    photoset_id: albumId,
    user_id: userId,
    format: 'json',
    nojsoncallback: '1',
    extras: 'url_k,url_h,url_b,url_c,o_dims',
  });
  try {
    const response = await fetcher(
      `https://www.flickr.com/services/rest/?${parameters}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return [];
    return selectFlickrPhotos(await response.json(), options);
  } catch {
    return [];
  }
}

export function getFlickrPhotos(albumId, userId, options = {}) {
  const key = JSON.stringify([albumId, userId, options]);
  if (!requests.has(key))
    requests.set(key, fetchFlickrPhotos(albumId, userId, options));
  return requests.get(key);
}
