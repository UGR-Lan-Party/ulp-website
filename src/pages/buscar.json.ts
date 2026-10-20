import { getCollection } from 'astro:content';
import { searchPages } from '../data/search-pages.js';
import { Competitions } from '../data/competitions-data';
import { venueZones, venuePlans } from '../data/venue-map';
import { faqs } from '../data/faqs';
export const prerender = true;
export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const entries = [
    ...searchPages,
    ...Competitions.map((activity) => ({
      title: activity.name,
      description: activity.description || activity.place,
      kind: 'Actividad',
      href: `/actividades/${activity.id}/`,
      keywords: `${activity.tag} ${activity.place} ${activity.id} ${activity.id === 'league-of-legends' ? 'lol' : ''}`,
    })),
    ...venueZones.map((zone) => ({
      title: zone.label,
      description:
        venuePlans.find((plan) => plan.id === zone.plan)?.buildingLabel ??
        'Plano de la ETSIIT',
      kind: 'Espacio',
      href: `/info/horarios/?plano=${zone.plan}#plano`,
      keywords: `aula ${zone.label.replaceAll('−', '-')}`,
    })),
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.snippet,
      kind: 'Noticia',
      href: `/blog/${post.id}/`,
    })),
    ...faqs.map((faq, index) => ({
      title: faq.title,
      description: faq.description,
      kind: 'Pregunta frecuente',
      href: `/info/preguntas_frecuentes${index < 6 ? '' : `/${Math.floor(index / 6) + 1}`}#pregunta-${faq.id}`,
    })),
  ];
  return Response.json(entries, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
