let current;

// Follow the device preference; no custom setting or stored override.
export function siteMotion() {
  return (current ??= matchMedia('(prefers-reduced-motion: reduce)'));
}

let scrollEntries;
// Desktop keeps its fades and blur; touch entrances stay opaque and sharp.
export function scrollEntryMotion() {
  return (scrollEntries ??= matchMedia(
    '(min-width: 768px) and (hover: hover) and (pointer: fine)',
  ));
}
