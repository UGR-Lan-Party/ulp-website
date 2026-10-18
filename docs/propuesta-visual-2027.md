# Web ULP 2.0

Web ULP 2.0 reúne el rediseño de la web y los ajustes revisados para preparar la edición de 2027. La rama `design/propuesta-visual-2027` se apoya en `fix/boton-album-centrado` (PR #357), última rama de la pila de mejoras previas. La franja de entidades, el contraste de logos, los iconos compactos, los accesos al horario y el botón de álbum forman parte de esa base.

## Dirección visual

Azules corporativos y beige claro `#F5F0E6` como superficie principal, con `#FCF8EF` para tarjetas. Se combina tipografía grande con etiquetas pequeñas, fotografía del evento, bordes finos y una jerarquía común de botones, tarjetas y secciones. El modo oscuro mantiene los mismos componentes y usa superficies azules.

La portada adopta una composición editorial con fotografía, una tarjeta de 2027 y un fondo que responde suavemente al cursor. Las actividades comparten tarjetas con ilustraciones renovadas y un tamaño visual equilibrado. Participan conserva las entidades y sus categorías con un diseño común; contacto, preguntas, cabeceras y pie siguen el mismo sistema.

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

Validación: build, recursos y rutas locales, 43 pruebas unitarias y 69 de navegador. Las comprobaciones incluyen el carrusel de entidades, navegación, móvil, ambos temas, galerías, agenda y render real de trofeos.

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

Discord conserva el estilo del titular y se presenta en un panel azul con una tarjeta de comunidad. Sobre nosotros incorpora contexto para su álbum de 2025, Twitch con un morado algo más oscuro y tarjetas reutilizables para las tres personas del equipo técnico y los diez perfiles de desarrollo.

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

## Décima revisión

LSI, UGR, DEIIT y GDG Granada ajustan su presentación a los límites visibles del logotipo en lugar de sus márgenes transparentes. Las medidas se guardan en `src/data/partner-logo-layout.json` y el componente compartido conserva las proporciones, los colores y los archivos originales.

Las tarjetas y la franja utilizan el mismo ajuste, con alturas adaptadas a cada rango. La marca horizontal de UGR dispone de más anchura en ambos contextos para mejorar la lectura del texto. Se mantiene la alternancia de variantes según el tema.

## Undécima revisión

El botón de Inscripciones de la portada lleva a `/actividades#competiciones`. La sección incorpora un margen de desplazamiento para que la barra de navegación no oculte su inicio.

Las competiciones del catálogo se ordenan por los votos de la columna «¿De qué juegos te gustaría que se realizaran torneos?» del archivo `ULP 2026 - Encuesta Inicial.xlsx`, con 342 respuestas con selección. Los datos agregados se guardan en `src/data/competition-survey-2026.json`, sin respuestas individuales ni información personal.

El orden es Mario Kart (130), Clash Royale (117), Smash (101), Wii Sports Tenis (94), Futbolín (91), Minecraft (81), Wii Sports Bolos (81), Ajedrez (80), Brawl Stars (80), Rocket League (72) y League of Legends (71). En los empates se conserva el orden previo. Ping Pong y Hacking Ético no aparecen entre las opciones de esa columna y se muestran al final sin asignarles votos. Retos y actividades conservan su orden.

Fuente local: `G:\Mi unidad\ULP\03 Organización\Encuestas\ULP 2026 - Encuesta Inicial.xlsx`. Se usa el recuento del archivo original consultado; el acta de reunión contiene un resumen con cifras diferentes. Una prueba de navegador recorre el enlace y comprueba el orden completo del catálogo.

## Duodécima revisión

Se revisan las redes de las 36 entidades y se añaden 34 enlaces en 18 de ellas, con un máximo de cuatro accesos por tarjeta incluyendo la web. La cafetería incorpora el Instagram confirmado por la organización. DEFC, DGE, ETSIIT, DEIIT, Hackiit, AMAT y OSL completan sus canales, entre otras entidades. Telegram y GitHub disponen de iconos blancos compactos.

Las fuentes y la selección de cada entidad se recogen en `docs/redes-entidades-2027.md`. No se atribuyen cuentas generales de la Universidad o la Biblioteca a departamentos sin perfiles propios confirmados.

Los titulares solicitados pasan a «Compite en tus juegos favoritos» y «Seguimos jugando en el servidor de Discord».

## Ajustes finales de titulares y equipo

«En el servidor de Discord» conserva una sola línea y adapta el tamaño a la anchura de su columna, comprobado entre 320 y 1440 px. El equipo técnico se muestra en el orden Antonio Miguel Mora (8 ediciones), Marcelino José Cabrera (3 ediciones) y Rafael Alejandro Rodríguez (2 ediciones).

## Animaciones de texto del home

El titular «UGR LAN / PARTY» se desplaza lateralmente en sentidos opuestos al hacer scroll. El recorrido se reduce en móvil para conservar la legibilidad. «Compite en tus juegos favoritos» aparece palabra a palabra con un desplazamiento lateral, un giro leve y una transición de desenfoque.

La inspiración visual parte de [Scroll Float](https://reactbits.dev/text-animations/scroll-float) y [Scroll Velocity](https://reactbits.dev/text-animations/scroll-velocity), de React Bits. La implementación utiliza APIs nativas sin añadir dependencias. Los textos permanecen visibles sin JavaScript y ambos efectos respetan la preferencia de movimiento reducido, incluso si cambia durante la visita.

La validación incluye tres pruebas de navegador para el desplazamiento, la legibilidad al terminar el revelado y la vista de 320 px sin JavaScript.


## Fichas de actividad

Las 26 fichas comparten una cabecera con tipografía Inter, colores corporativos, carta holográfica y accesos a las reglas y los premios cuando existen. La inscripción se presenta como una franja compacta que mantiene el estado de archivo de 2026. Ubicación y horarios utilizan un único panel adaptable, sin fuentes externas.

Las cartas eliminan el logotipo de la actividad y el rótulo «Carta holográfica interactiva». Las ilustraciones transparentes se ajustan a sus límites visibles y ocupan un espacio menor, conservando los degradados de los recortes. El brillo responde al puntero y el movimiento respeta la preferencia de movimiento reducido.

El trofeo mantiene su carga automática, el fondo transparente, la interacción y el dorado existente. Su panel adopta los bordes y superficies de la nueva UI; debajo aparecen los premios en tarjetas alineadas, con la distinción entre oro, plata, bronce y MVP. Solo se muestran puestos con premios definidos.

La verificación recorre las 26 fichas sin JavaScript en móvil para contrastar nombres, reglas, horarios y premios con los datos originales. También comprueba la interacción holográfica y el cambio de preferencia de movimiento; las pruebas del visor validan el render real y transparente en ambos temas, además del reintento tras un fallo de red.

## Galería, comunidad y footer

«Granada, vista desde la ULP» conserva sus textos y tipografía. La galería elimina el marco exterior y añade cinco miniaturas seleccionables, manteniendo la foto destacada, las proporciones, la navegación, el zoom y el enlace al álbum. Las miniaturas utilizan las URLs pequeñas que devuelve Flickr; comparten la consulta al álbum con las fotos grandes.

El footer incorpora estrellas a ambos lados, centra el copyright y añade Inscripciones a la izquierda con destino a `/actividades#competiciones`. En móvil, los enlaces se sitúan debajo del crédito centrado.

Profesorado sustituye a Equipo técnico y sus insignias de ediciones aumentan de tamaño. Se reduce el espacio con Código hecho en comunidad. Las tarjetas de desarrollo centran las fotos sin la etiqueta de desarrollo web y muestran el icono de GitHub junto al enlace. Los subtítulos de las entidades en Participan utilizan la cursiva serif de la portada.

El titular de competiciones repite la animación cada vez que vuelve a entrar en pantalla desde cualquiera de los dos sentidos. Se mantiene visible sin JavaScript y respeta el movimiento reducido. La validación comprueba la repetición, la selección de miniaturas y las URLs de Flickr, además del centrado del footer entre 320 y 1440 px y la carga real de imágenes en localhost.

## Premios retro y galería de tres fotos

Los premios recuperan el carácter arcade: títulos y posiciones con Press Start 2P, marcos de píxel, líneas de pantalla, medallas flotantes, destellos y brillo suave. El podio sitúa al campeón en el centro en escritorio y mantiene el orden de lectura en móvil. Las animaciones se detienen al activar movimiento reducido; los premios conservan su contenido original.

La tipografía se aloja localmente con su licencia SIL OFL, procedente del [repositorio oficial de Google Fonts](https://github.com/google/fonts/tree/main/ofl/pressstart2p). El cuerpo de los premios conserva Inter para facilitar su lectura.

El trofeo se presenta sobre el azul oscuro de Discord en ambos temas. La imagen de fondo de la tarjeta de cada competición se utiliza al 9 % de opacidad y con saturación reducida al 15 %. El título incorpora el nombre de la competición. El visor conserva su fondo transparente, interacción y carga automática.

La galería de Granada sustituye las miniaturas por tres fotografías grandes: la central nítida y las dos vecinas al 94 % de tamaño, con menor opacidad, saturación y enfoque. Las flechas, los laterales pulsables y el teclado sincronizan las tres imágenes con el zoom. En móvil los laterales asoman a ambos lados sin desbordar la página. Las imágenes laterales utilizan variantes de resolución media de Flickr; la central mantiene su resolución original.

## Ajustes de footer, entidades y contacto

El footer conserva únicamente el mosaico derecho. Los subtítulos de las tarjetas de Participan vuelven a Inter sin cursiva. Contacto sustituye el acceso a Instagram por el enlace al Linktree de ULP, con su icono y el texto «También puedes encontrarnos en RRSS».

## Primer prototipo del plano de la ETSIIT

Horarios incorpora una vista vectorial del edificio triangular y las aulas prefabricadas, con líneas que terminan en círculos sobre las zonas. El dibujo es una interpretación simplificada de los planos de organización de 2026. La búsqueda por actividad, aula, día y hora actualiza a la vez los resultados, el plano y la tabla. Una actividad en varias aulas resalta todas sus zonas; pulsar una zona filtra sus actividades. El giro funciona arrastrando horizontalmente, con botones o con las flechas del teclado; Inicio restablece la orientación. Los rótulos permanecen legibles al girar y los puntos siguen unidos a los contornos. En móvil se prioriza el dibujo y los nombres se consultan en el listado.

La tabla se conserva tras «Ver agenda en tabla», con inscripciones, contraste alterno y funcionamiento sin JavaScript. El programa oficial de viernes y sábado se pliega inicialmente mediante un desplegable nativo. Al abrirlo mantiene su experiencia original de scroll; GSAP se sirve localmente y se inicializa una sola vez al abrir, recalculando las posiciones al reabrir.

Las posiciones son preliminares y reúnen varias plantas; no constituyen todavía un plano de navegación exacto. La Sala de Profesores Externos, ubicación de Hacking Ético en el programa, queda sin marcador hasta confirmar su posición. Se conservan sus actividades y horarios en los resultados.

Fuentes y límites de interpretación: `docs/plano-etsiit-2026.md`. Verificación: correspondencia de varias aulas, búsqueda como texto, filtros combinados, selección de zonas, giro con arrastre y teclado, anchuras de 320 y 390 px, despliegue y reapertura del programa y movimiento reducido.

## Navegación, profundidad y lectura

Las fichas incorporan flechas laterales discretas junto a la carta, con nombres accesibles y enlaces nativos. Recorren su categoría en el mismo orden que el catálogo y enlazan el último elemento con el primero. La ordenación de competiciones por la encuesta se comparte entre ambas vistas.

Los logotipos de Participan responden al puntero con una inclinación máxima de pocos grados y una profundidad leve. El efecto se aplica al logo, se restablece al salir y respeta movimiento reducido y dispositivos táctiles.

Street Fighter II utiliza el fondo de juego aportado; Cars pasa a «Cars: Copa Pistón» en la fuente de datos común. El aviso de equipo grande precede a las competiciones y la invitación compacta se sitúa al final del catálogo.

Contacto y Localización incorporan una captura de satélite de Maps centrada en la ETSIIT al 6 % de opacidad, sin saturación, con desenfoque de 2 px y con un degradado que difumina todos los bordes.

La galería precarga las fotos cercanas y espera su carga y decodificación antes de cambiar las imágenes y el contador e iniciar la transición. La foto actual permanece visible durante la espera; varios clics rápidos solo muestran la última solicitud. La caché de imágenes preparada se limita a doce recursos. Un fallo permite reintentar conservando la foto anterior.

Las noticias unifican su tipografía en Inter, eliminan la capitular y ajustan ancho, tamaños, contraste e interlineado. Los párrafos se justifican con separación silábica automática; las citas conservan alineación al inicio para evitar huecos excesivos.

La validación incluye navegación circular en móvil, orden de los avisos, profundidad y movimiento reducido, tipografía y justificación del blog, y una carga de imagen retenida deliberadamente con solicitudes consecutivas. La galería también se comprueba con fotos reales de Flickr.

## Planos por edificio y planta

Horarios separa el edificio principal en planta 0 y planta baja e incorpora vistas independientes para las aulas −1.1/−1.2 y las prefabricadas A y B. Los contornos y el mobiliario se dibujan en SVG siguiendo los PNG y el PSD de organización. El plano, el listado, la cabecera de agenda y la tabla se sitúan sobre el fondo de la web; únicamente el formulario de filtros conserva el panel azul.

El giro tiene cuatro estados de 90 grados. Cada plano dispone de una configuración de indicadores para cada orientación. Durante la transición se ocultan las líneas, gira el dibujo y aparecen los indicadores en sus nuevas posiciones; el movimiento reducido cambia directamente al estado final. Se puede navegar con los cuatro botones, las flechas laterales, el teclado o un gesto horizontal que avanza un único estado al soltar.

Seleccionar una actividad abre la planta correspondiente. Si ocupa varias ubicaciones, estas siguen marcadas al cambiar de edificio. El título pasa a «Plano interactivo» y se eliminan la insignia preliminar, los avisos de distribución y las instrucciones de giro antiguas. La tabla y los programas desplegables se mantienen.

Las pruebas comprueban las veinte combinaciones de planta y orientación: puntos dentro del área visible y ausencia de intersecciones entre los indicadores. También verifican el cambio de planta, los resultados de varios edificios, el giro, los dos temas, móvil, filtros y movimiento reducido.


El título de la competición de motor pasa a «Fórmula1» en el programa y en el archivo de la edición. Las columnas laterales del footer tienen el mismo ancho para alinear el centro de las redes sociales con el copyright.


## Cifras, recuerdos y retransmisiones

El home incorpora cifras de asistencia, actividades, entidades y visualizaciones acumuladas, con el número destacado, la etiqueta debajo e iconos oficiales de Bootstrap Icons. Las fuentes y fecha de corte se conservan en la documentación. Participan añade las cuatro fotografías seleccionadas de charlas, stands y encuentros. El cronograma de ediciones sustituye a los botones de años e incorpora enlaces nativos a cada edición y el intervalo 2020–2022 sin edición.

Twitch muestra la última retransmisión disponible, con un fotograma real del evento y reproducción integrada bajo demanda. Los trofeos pueden ampliarse manteniendo la misma escena, con cierre por botón, fondo o Escape y retorno del foco. El nombre del sitio se unifica como «UGR LAN Party» en título, Open Graph, manifiesto y datos estructurados. La página 404 se excluye de indexación y no genera una URL canónica inexistente.

Procedencia, metodología de las cifras y mantenimiento de Twitch: [Cifras y multimedia](cifras-y-multimedia.md).

## Carrusel de competiciones y Alhambra

El home muestra tres competiciones a la vez, también en móvil, y permite recorrer las trece mediante flechas laterales. Conserva Mario Kart, Hacking Ético y League of Legends al inicio. El avance automático desplaza una posición hacia la izquierda cada cinco segundos mientras la sección está visible. Se pausa con el cursor o el foco dentro, y al ocultar la pestaña. No incorpora botón de pausa. Movimiento reducido desactiva el avance automático y las transiciones; las flechas siguen funcionando. Las tarjetas fuera de vista son inertes y se ocultan del árbol accesible. Se precargan las tarjetas adyacentes y se mantiene la profundidad de sus imágenes.

Granada, vista desde la ULP incorpora un dibujo decorativo de la Alhambra elegido por la organización, extendida hasta ambos bordes de la ventana, con azul corporativo y baja opacidad. En tema oscuro usa el acento de la paleta para conservar un contraste tenue. El dibujo queda limitado a la banda del encabezado y se desvanece hacia su borde inferior; no invade la zona de las fotografías. Se acorta moderadamente el espacio entre competiciones y cifras, se corrige «Fórmula 1» y Participan incorpora el botón «Contáctanos» dirigido a ulp@ugr.es.


Las galerías triples de Home y Sobre nosotros utilizan previsualizaciones de proporción fija 4:3. Las fotografías se centran y recortan sin deformarse; al ampliarlas se usa la imagen de mayor resolución con su proporción completa. El logo de Mars Gaming aumenta ligeramente en la franja de partners.


## Validación conjunta para la PR Web ULP 2.0

Revisión del 16 de octubre de 2026: compilación de 47 páginas con Flickr activo, 50 pruebas unitarias y 81 pruebas de navegador en Edge superadas. Se comprueban las rutas e imágenes locales, ambos temas, navegación móvil, galerías y fotos verticales, agenda y planos, emparejamientos, logos y render WebGL de trofeos. Los datos de torneos y cifras se publican como instantáneas históricas; no se activa ninguna sincronización externa.


## Ajustes de interacción del 18 de octubre

La portada prescinde del componente de Twitch; sigue disponible en Sobre nosotros. El álbum Una escuela, muchas partidas utiliza las fotos de 2025. El aviso de equipo explica el Excel compartido y utiliza un mosaico de hexágonos regulares.

Las cartas holográficas responden al hover y al contacto táctil, con una actualización por frame y retorno al estado de reposo al terminar o cancelar el gesto. Se respeta la preferencia de movimiento reducido. La franja de partners diferencia el hover de ratón del toque, pausa durante el arrastre y reanuda tras terminar la inercia; el foco de teclado mantiene la pausa.
