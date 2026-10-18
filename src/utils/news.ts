import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedNews() {
  const now = new Date();
  return (
    await getCollection(
      'blog',
      ({ data }) => !data.draft && data.publishDate <= now,
    )
  ).sort(
    (first, second) =>
      second.data.publishDate.valueOf() - first.data.publishDate.valueOf(),
  );
}

export function formatNewsDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'long',
    timeZone: 'Europe/Madrid',
  }).format(date);
}

export function getReadingMinutes(entry: CollectionEntry<'blog'>) {
  const words = [
    entry.data.postDetails.paraOne,
    entry.data.postDetails.paraTwo,
    entry.data.postDetails.paraThree,
    entry.data.postDetails.paraFour,
    entry.data.postDetails.paraFive,
    entry.data.postDetails.paraSix ?? '',
    entry.body ?? '',
  ]
    .join(' ')
    .trim()
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
