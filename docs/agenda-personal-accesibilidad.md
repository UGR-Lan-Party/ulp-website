# Agenda personal, fichas y revisión de accesibilidad

Revisión del 16 de octubre de 2026.

## Agenda personal

La sección «Mi agenda» está en `/info/horarios#mi-agenda`. Cada franja de la tabla se puede guardar individualmente. Desde la ficha se guardan o retiran todas las franjas de esa actividad. El estado se conserva entre páginas, recargas y pestañas del mismo origen.

La clave `ulp-agenda:2026:v1` de localStorage contiene exclusivamente una lista de identificadores públicos conocidos, compuestos por edición, actividad e inicio. No se solicitan cuentas, nombres ni correos. La selección de favoritos no se envía al servidor. Si el almacenamiento está bloqueado, la selección sigue funcionando en memoria durante la visita y se puede descargar. Los identificadores desconocidos y los datos corruptos se descartan. Una nueva edición utiliza otra clave.

Los solapamientos comparan intervalos con inicio y final confirmados; no consideran conflicto que una actividad empiece justo al terminar otra. Las franjas sin fin no reciben una duración inventada y no se incluyen en ese cálculo. Guardar una actividad no equivale a inscribirse.

La descarga `.ics` genera VEVENT con UID estable, fechas UTC, ubicación y enlace de la actividad cuando existe. Escapa texto y pliega líneas a 75 octetos sin cortar Unicode. Si no hay final confirmado, omite DTEND. Se utilizan los datos reales de 2026, incluidos sus días y fechas; no se trasladan automáticamente a 2027. Referencia: [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545).

## Resumen de actividad

Cada ficha resume primer horario, zona, formato conocido y estado de inscripción. Indica si hay más franjas y enlaza las reglas para plazas, material y requisitos, sin inventar cupos ni necesidades. Se conserva el bloque completo de ubicación/horarios, las reglas, los premios y el visor automático de trofeos.

## Accesibilidad

Se corrigen contrastes en textos secundarios, los índices de FAQ y las etiquetas de partners, el nombre accesible de la marca y de enlaces de noticias, Twitch y personas, y la superficie pulsable del correo del footer. La tabla admite foco y desplazamiento por teclado. Los marcadores del plano anuncian selección y las zonas ocultas salen del recorrido de foco.

Los favoritos anuncian su estado, conservan el foco tras quitar una franja y funcionan con teclado. El contenido del programa y los resúmenes siguen disponibles sin JavaScript. Se comprueban anchos entre 320 y 1440 px, claro/oscuro y movimiento reducido.

Auditoría axe-core 4.14.0 sobre ocho páginas en móvil, con ambos temas: Home, Horarios, Ajedrez, Participan, Ediciones anteriores, Noticias, Contacto y Sobre nosotros. Sin infracciones detectadas por las reglas WCAG A/AA aplicadas. En Horarios se incluye una actividad guardada y la fila en hover. Esta auditoría y las pruebas de teclado son parciales; no constituyen una certificación de conformidad.

## Medición anterior de carga bajo demanda

La medición siguiente corresponde a la versión anterior que descargaba Three.js al acercarse al visor. Desde el 18 de octubre, el trofeo empieza a cargar al abrir la ficha, por petición de la organización. Por tanto, la reducción de JavaScript indicada para Ajedrez ya no describe la carga inicial actual. GSAP y ScrollTrigger esperan a que se despliegue el programa oficial y no se solicitan con movimiento reducido. Se mantienen reintentos, cierre, retorno de foco y render WebGL.

Medición local con Edge, versión compilada, viewport 390 × 844, sin caché entre páginas y movimiento reducido. Bytes de respuestas JavaScript de `/_astro/`, sin compresión de transporte; excluye analítica externa y herramientas de auditoría. Comparación histórica de la visita inicial, antes de acercarse al trofeo o desplegar el programa:

| Ruta | Antes (bytes) | Después (bytes) | Reducción |
| --- | ---: | ---: | ---: |
| `/` | 8,572 | 8,572 | 0.0 % |
| `/info/horarios/` | 136,708 | 28,745 | 79.0 % |
| `/actividades/ajedrez/` | 517,672 | 12,283 | 97.6 % |
| `/participan/` | 4,261 | 4,261 | 0.0 % |

No se han medido Core Web Vitals de usuarios reales ni se extrapolan estos tamaños a tiempos de carga en dispositivos concretos.

## Validación

- Compilación de 47 páginas con Flickr activo.
- 54 pruebas unitarias y 85 pruebas de navegador correctas.
- Rutas, redirecciones e imágenes locales correctas.
- Pruebas específicas de persistencia, almacenamiento bloqueado, solapamientos, descarga ICS, teclado, foco y carga diferida.
- Trofeos reales en claro/oscuro, ampliación y recuperación ante fallo de red.
