import { createEventPayload } from '../utils/analytics.js';

declare global {
  interface Window {
    umami?: {
      track: (
        event: (context: Record<string, unknown>) => Record<string, unknown>,
      ) => Promise<unknown> | void;
    };
  }
}

function trackActivityLink(event: MouseEvent) {
  if (navigator.doNotTrack === '1') return;
  if (event.type === 'auxclick' && event.button !== 1) return;
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>(
    'a[data-analytics-event]',
  );
  if (!link) return;
  const {
    analyticsEvent: name,
    analyticsEdition: edition,
    analyticsActivity: activity,
  } = link.dataset;
  if (
    !['registration-click', 'rules-click'].includes(name ?? '') ||
    !/^\d{4}$/.test(edition ?? '') ||
    !/^[a-z0-9-]+$/.test(activity ?? '')
  )
    return;
  try {
    const pending = window.umami?.track((context) =>
      createEventPayload(context, {
        name,
        edition,
        activity,
        path: window.location.pathname,
      }),
    );
    Promise.resolve(pending).catch(() => {});
  } catch {}
}

document.addEventListener('click', trackActivityLink);
document.addEventListener('auxclick', trackActivityLink);
