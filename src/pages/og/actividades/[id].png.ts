import type { APIRoute } from 'astro';
import { Competitions } from '../../../data/competitions-data';
import { renderActivitySocial } from '../../../utils/activity-social-image';
export const prerender = true;
export function getStaticPaths() {
  return Competitions.map((activity) => ({
    params: { id: activity.id },
    props: { activity },
  }));
}
export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderActivitySocial(props.activity)), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
