import test from 'node:test';
import assert from 'node:assert/strict';
import { searchSite, safeInternalHref } from '../src/utils/global-search.js';
test('El buscador acepta texto literal, acentos y signos sin evaluar expresiones', () => {
  const data = [
    {
      title: 'Fórmula 1',
      description: 'Simulador',
      kind: 'Actividad',
      href: '/actividades/formula-1/',
    },
    {
      title: 'Aula −1.1',
      description: 'Plano',
      keywords: 'aula -1.1',
      kind: 'Espacio',
      href: '/info/horarios/?plano=aulas-inferiores#plano',
    },
  ];
  assert.equal(searchSite(data, 'formula 1')[0].title, 'Fórmula 1');
  assert.equal(searchSite(data, 'aula -1.1')[0].kind, 'Espacio');
  for (const query of [
    '<script>alert(1)</script>',
    '(a+)+$',
    '[.*',
    'a'.repeat(100000),
  ])
    assert.deepEqual(searchSite(data, query), []);
});
test('Los enlaces del índice no admiten protocolos externos ni escapes de origen', () => {
  for (const href of [
    'https://evil.invalid/',
    '//evil.invalid/',
    'javascript:alert(1)',
    '/\\evil.invalid/',
    '/a\nb',
    null,
  ])
    assert.equal(safeInternalHref(href), null);
  assert.equal(
    safeInternalHref('/info/horarios/?plano=principal-0#plano'),
    '/info/horarios/?plano=principal-0#plano',
  );
});

test('Las secciones se encuentran por nombre y términos habituales', async () => {
  const { searchPages } = await import('../src/data/search-pages.js');
  for (const [query, href] of [
    ['horario', '/info/horarios/'],
    ['ediciones anteriores', '/info/ediciones_anteriores/'],
    ['edición anterior', '/info/ediciones_anteriores/'],
    ['cómo llegar', '/info/localizacion/'],
    ['inscripción', '/actividades/#competiciones'],
    ['mi agenda', '/info/horarios/#mi-agenda'],
    ['correo', '/contacto/'],
  ])
    assert.equal(searchSite(searchPages, query)[0]?.href, href);
  assert(searchPages.every((entry) => safeInternalHref(entry.href)));
});
