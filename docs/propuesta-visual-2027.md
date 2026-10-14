# Propuesta visual ULP 2027

Rama local: `design/propuesta-visual-2027`, creada desde `fix/agenda-galerias-identidad`. El rediseño completo se conserva localmente, pendiente de revisión y sin PR. Se han integrado las mejoras independientes de las PR #353–#357, publicadas por petición expresa: franja de entidades, contraste de logos, tamaño de iconos, accesos al horario y botón de álbum.

## Dirección visual

Azules corporativos y beige claro `#F5F0E6` como superficie principal, con `#FCF8EF` para tarjetas. Se combina tipografía grande con etiquetas pequeñas, fotografía del evento, bordes finos y una jerarquía común de botones, tarjetas y secciones. El modo oscuro mantiene los mismos componentes y usa superficies azules.

La portada adopta una composición editorial con fotografía, una tarjeta de 2027 y un fondo que responde suavemente al cursor. Las actividades comparten tarjetas con las ilustraciones existentes. Participan conserva las entidades y sus categorías con un diseño común; contacto, preguntas, cabeceras y pie siguen el mismo sistema.

Las animaciones incluyen entradas al hacer scroll, brillo al pasar por las tarjetas, pequeños elementos flotantes y un carrusel continuo de marcas. Son implementaciones en Astro, CSS y JavaScript inspiradas en [DreamHack](https://dreamhack.com/) y [React Bits](https://reactbits.dev/c/animations). No se añaden dependencias.

## Franja de entidades

`PartnerStrip.astro` reutiliza el catálogo de patrocinadores y colaboradores. El registro de patrocinador secreto sin entidad confirmada se excluye.

- Avance automático suave, pausado al pasar el cursor o enfocar un enlace.
- La rueda vertical o lateral desplaza las entidades horizontalmente.
- Un clic central permite avanzar un tramo.
- Flechas de teclado y desplazamiento táctil, sin botones de anterior/siguiente. Los rangos se distinguen con separadores y sus nombres.
- Las copias visuales del bucle no se anuncian ni se incluyen en la navegación de teclado.
- La preferencia de movimiento reducido detiene el avance automático; los controles siguen disponibles.
- La animación se pausa fuera de pantalla y cuando la pestaña no está visible.

La franja aparece bajo la portada y antes del pie en las páginas interiores. Los logotipos adaptan su contraste al tema. Las tarjetas de Participan fijan la variante oscura sobre su superficie beige, también en modo oscuro.

## Revisión del diseño

La portada conserva las fuentes, amplía la separación entre UGR y LAN y usa relleno sólido para PARTY. Los textos se centran en la ETSIIT, Granada y la comunidad ULP. El footer recupera una estructura compacta próxima al original, con siete redes representadas por iconos, correo y ubicación. El programa oficial usa el azul corporativo `#004465`.

Noticias comparte una tarjeta reutilizable, destaca la última publicación y ofrece artículos con fecha en español, tiempo de lectura, imagen completa descargable, contenido y noticias relacionadas. Se omiten borradores y publicaciones futuras.

## Contenido y comprobación

Se mantienen los datos históricos de 2026 y sus inscripciones cerradas. Las actividades y entidades de esa edición no se presentan como confirmadas para 2027.

La propuesta se puede revisar en [Inicio](http://127.0.0.1:4321/), [Actividades](http://127.0.0.1:4321/actividades/), [Participan](http://127.0.0.1:4321/participan/) y [Contacto](http://127.0.0.1:4321/contacto/), [Noticias](http://127.0.0.1:4321/blog/) y [Horarios](http://127.0.0.1:4321/info/horarios/).

Validación: build, recursos y rutas locales, 37 pruebas unitarias y 50 de navegador. Las comprobaciones incluyen el carrusel de entidades, navegación, móvil, ambos temas, galerías, agenda y render real de trofeos.

## Segunda revisión

La cabecera mantiene UGR LAN PARTY en una sola línea. La portada usa una foto de 2048 × 1365 píxeles del álbum de ULP 2025, con variantes WebP hasta 2048 y carga adaptada a cada pantalla. El original está en `public/assets/about/ulp-2025-comunidad.jpg`; el generador de imágenes conserva esta resolución para la portada.

Participan comparte el orden de rangos con la franja. Los rangos se distinguen mediante títulos, tamaño de logotipo y tarjeta, borde y acabado, manteniendo el azul corporativo. Granajoven conserva sus colores y presenta las letras blancas en negro sobre superficies claras mediante un filtro de presentación; el archivo original se conserva.

Las actividades recuperan profundidad: el fondo se inclina y el personaje avanza hacia el primer plano al pasar el cursor o enfocar con teclado. Con movimiento reducido o entrada táctil las ilustraciones permanecen estables.

El archivo incorpora navegación por año, el cartel y programa de 2026, y galerías alternadas para 2016–2025. Los textos históricos y enlaces se conservan, y los detalles de cada edición se abren sin JavaScript. No se añade una edición en los años sin evento registrado.

Fuente de la fotografía de portada: [álbum ULP 2025 en Flickr](https://www.flickr.com/photos/195749897@N03/54744130134/in/album-72177720328590176/).

## Tercera revisión

La barra de navegación oscurece ligeramente su superficie al desplazar la página. La barra de herramientas de Astro pertenece exclusivamente al servidor de desarrollo y no se incluye en la compilación de producción. El pie usa el formato «2016 — año actual @ UGR LAN Party | Universidad de Granada».

El texto de presentación se justifica y el título pasa a «Lo que nos une no está solo en el temario». Discord sustituye al asterisco del bloque de comunidad, conservando su opacidad baja. Linktree dispone de un componente compacto, visible únicamente en portada antes del pie, con el emblema de la marca.

La galería de portada se presenta dentro de MemoryGallery y comienza con la antigua foto 424: `54744102704`. Se identifica por su ID de Flickr para mantener la selección si cambia el orden del álbum; el resto de fotografías conserva su orden y no se altera el carrusel del archivo de ediciones.

El catálogo ofrece el acceso para buscar equipo tanto al principio como al final. Cuatro iconos SVG nuevos y cuatro ilustraciones transparentes renuevan Watch Party, Indie Fest, Juego Libre, Paella y Pokémon TCG según lo solicitado. Los fondos de las tarjetas se amplían y difuminan en el borde inferior para mantener la inclinación sin dejar bordes a la vista.

Las entradas de noticias incorporan portada con imagen lateral sin recortar, autor, tiempo de lectura, enlaces internos y superficie de lectura. La agenda alterna dos azules, recalculando el contraste entre las filas visibles al filtrar.

Los archivos y prompts de las ilustraciones están documentados en `docs/recursos-visuales-2027.md`.

## Cuarta revisión

Participan reduce el espacio inicial entre la invitación y las entidades e incorpora navegación por rangos, contadores y cabeceras más claras. Las tarjetas mantienen el contraste de logos y las diferencias entre categorías.

La paella dispone de una ilustración transparente nueva y los cuatro iconos de actividades usan emblemas sólidos con la paleta corporativa. La presentación utiliza otra foto real de ULP 2025 a 2048 píxeles, guardada en `public/assets/about/ulp-2025-retro.jpg`; el sello pasa a «Hecho en la ETSIIT».

Discord conserva el estilo del titular y se presenta en un panel azul con una tarjeta de comunidad. Sobre nosotros incorpora contexto para su álbum de 2024, Twitch con un morado algo más oscuro y tarjetas reutilizables para las tres personas del equipo técnico y los diez perfiles de desarrollo.

Localización presenta dirección, enlace para llegar y mapa en un marco común. El aviso legal incorpora índice y bloques de lectura, conservando íntegros los textos existentes y pendiente del contenido aprobado para 2027. El footer mantiene sus siete iconos sociales y suma accesos de navegación.

Las preguntas se reparten en tres páginas estáticas de 6, 6 y 4 elementos. La portada conserva sus cinco preguntas resumidas. Los enlaces numerados funcionan sin JavaScript y mantienen la página al recargar.

Dos zonas, presentación y footer, incorporan motivos geométricos vectoriales simplificados inspirados en los alicatados granadinos, al 4 % de opacidad. Referencia cultural: [Educación Artística y comunicación del Patrimonio de Al-Ándalus, disponible en la Cátedra de Artesanía de la UGR](https://catedras.ugr.es/artesania/sites/webugr/artesania/public/ficheros/CUADERNO%20141%20PALERMO%20ARG_libro.pdf#page=150).

Emblema de Linktree: [Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/linktree.svg), integrado localmente como `public/assets/icons/LinktreeIcon.astro`.

## Quinta revisión

La portada amplía el espacio entre letras y entre UGR y LAN, y utiliza el texto «El mayor evento universitario de eSports y videojuegos». Discord conserva el titular y simplifica la composición en dos zonas, con un acceso destacado al servidor.

Las galerías de portada y Sobre nosotros limitan la imagen a 380 px y eliminan el espacio vertical redundante dentro del marco. El footer pierde su fila superior de marca y navegación, manteniendo los siete iconos sociales, el correo, la ubicación y el aviso legal. El sello «Hecho en la ETSIIT» adopta un formato horizontal compacto.

Se renuevan las ilustraciones transparentes de Ping Pong, Super Smash Bros Ultimate, Wii Sports Bolos, Rocket League, Ajedrez, Juego Retro, Street Fighter II, Beat Saber y Tetris. Futbolín utiliza una nueva versión del recorte del grupo y la mesa. Los originales anteriores se conservan; los archivos y prompts nuevos figuran en `docs/recursos-visuales-2027.md`.

Las 26 tarjetas ajustan el tamaño al contenido visible de cada ilustración, ignorando sus márgenes transparentes. El ajuste comparte límites de anchura y altura y mantiene el efecto de profundidad. Tras sustituir una ilustración, `pnpm images:measure` actualiza las medidas de presentación en `src/data/activity-art-layout.json`; no modifica las imágenes.

El visor de premios reduce la intensidad de las luces y aplica un mapeado tonal con menor exposición para mostrar un dorado más oscuro. Conserva el fondo transparente y la carga automática en ambos temas.

## Sexta revisión

Ediciones anteriores muestra la historia completa sin desplegables. Cada edición sitúa su cabecera y sus textos junto al carrusel, alternando el lado de la galería; en móvil el texto precede a las fotos. Se elimina el marco exterior, se reduce el espacio vertical y las imágenes mantienen su proporción con una altura máxima de 340 px. La edición de 2026 también reduce su altura y pierde el borde exterior.

Smash utiliza el PNG transparente de Mario de la [web oficial de Super Smash Bros. Ultimate](https://www.smashbros.com/en_US/fighter/01.html), servido con variantes WebP locales y el mismo ajuste de tamaño que el resto de ilustraciones. Ajedrez, Futbolín y Ping Pong incorporan emblemas vectoriales de la misma familia que Indie Fest y Watch Party; los siete emblemas comparten un tamaño compacto de 36 px.

El texto de portada se actualiza a «El mayor evento universitario de eSports y videojuegos de toda Andalucía!» según lo solicitado.

## Séptima revisión

AEVI utiliza una versión original de mayor resolución con letras oscuras, conservando el rojo y amarillo del símbolo. Hackiit utiliza el SVG aportado, con sus letras negras y detalles rojos. Nacon utiliza el SVG azul oscuro de su web corporativa. Las tarjetas mantienen estas variantes sobre superficie clara en ambos temas y la franja conserva su versión blanca en modo oscuro.

Los textos de localización se refieren a la ETSIIT, la Universidad de Granada y la dirección postal.

## Octava revisión

Las imágenes frontales de Hacking Ético, League of Legends, Futbolín y F1 se desvanecen progresivamente en su parte inferior mediante una máscara CSS, conservando los archivos y la animación de profundidad. Cars reduce su tamaño al 80 % del ajuste anterior.

Los motivos geométricos pasan de 16 a 48 piezas más próximas y ocupan una zona algo más amplia, con una transición suave hacia el contenido. La presentación mantiene el hueso y el footer incorpora estrellas de ocho puntas. Ambas zonas conservan una opacidad discreta del 4,5 % y los motivos son decorativos para lectores de pantalla.

## Novena revisión

La Universidad de Granada utiliza la marca institucional horizontal a color, descargada de Secretaría General. Se ajusta únicamente el lienzo vacío del SVG para que el símbolo y el texto se lean al tamaño de las tarjetas y de la franja de entidades.

Los dos fondos decorativos usan estrellas de ocho puntas en una trama SVG que repite piezas de 64 px. El patrón cubre toda la altura de cada componente, también al crecer el contenido en móvil, sin estirar las estrellas. La opacidad permanece en el 4,5 % y el desvanecimiento se aplica solo de izquierda a derecha.
