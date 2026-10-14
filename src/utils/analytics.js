export function createEventPayload(context, { name, edition, activity, path }) {
  return {
    website: context.website,
    hostname: context.hostname,
    screen: context.screen,
    language: context.language,
    url: path.split(/[?#]/)[0],
    name,
    data: { edition, activity },
  };
}
