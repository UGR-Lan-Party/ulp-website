# Propuesta visual ULP 2027

Rama local: `design/propuesta-visual-2027`, creada desde `fix/agenda-galerias-identidad`. La propuesta se conserva sin crear issue ni PR.

## Dirección visual

Azules corporativos y beige claro `#F5F0E6` como superficie principal, con `#FCF8EF` para tarjetas. Se combina tipografía grande con etiquetas pequeñas, fotografía del evento, bordes finos y una jerarquía común de botones, tarjetas y secciones. El modo oscuro mantiene los mismos componentes y usa superficies azules.

La portada adopta una composición editorial con fotografía, una tarjeta de 2027 y un fondo que responde suavemente al cursor. Las actividades comparten tarjetas con las ilustraciones existentes. Participan conserva las entidades y sus categorías con un diseño común; contacto, preguntas, cabeceras y pie siguen el mismo sistema.

Las animaciones incluyen entradas al hacer scroll, brillo al pasar por las tarjetas, pequeños elementos flotantes y un carrusel continuo de marcas. Son implementaciones en Astro, CSS y JavaScript inspiradas en [DreamHack](https://dreamhack.com/) y [React Bits](https://reactbits.dev/c/animations). No se añaden dependencias.

## Franja de entidades

`PartnerStrip.astro` reutiliza el catálogo de patrocinadores y colaboradores. El registro de patrocinador secreto sin entidad confirmada se excluye.

- Avance automático suave, pausado al pasar el cursor o enfocar un enlace.
- La rueda vertical o lateral desplaza las entidades horizontalmente.
- Un clic central permite avanzar un tramo.
- Controles anterior/siguiente, flechas de teclado y desplazamiento táctil.
- Las copias visuales del bucle no se anuncian ni se incluyen en la navegación de teclado.
- La preferencia de movimiento reducido detiene el avance automático; los controles siguen disponibles.
- La animación se pausa fuera de pantalla y cuando la pestaña no está visible.

La franja aparece bajo la portada y antes del pie en las páginas interiores. Los logotipos claros reciben un ajuste de contraste para poder verlos sobre beige.

## Contenido y comprobación

Se mantienen los datos históricos de 2026 y sus inscripciones cerradas. Las actividades y entidades de esa edición no se presentan como confirmadas para 2027.

La propuesta se puede revisar en [Inicio](http://127.0.0.1:4321/), [Actividades](http://127.0.0.1:4321/actividades/), [Participan](http://127.0.0.1:4321/participan/) y [Contacto](http://127.0.0.1:4321/contacto/).

Validación: build, recursos y rutas locales, 36 pruebas unitarias y 34 de navegador. Las comprobaciones incluyen el carrusel de entidades, navegación, móvil, ambos temas, galerías, agenda y render real de trofeos.
