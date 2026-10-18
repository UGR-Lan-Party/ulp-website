# Cifras y multimedia de la comunidad

## Cifras del home

`EventStats.astro` obtiene las actividades de `program-2026.json` y cuenta los nombres únicos del directorio público `partners`. En esta revisión son 26 actividades y 36 entidades. La cifra de más de 600 asistentes de 2026 procede de la organización.

`src/data/home-metrics.json` conserva solo los totales públicos necesarios, sin identificadores personales ni credenciales. Fecha de corte: 8 de octubre de 2026.

| Fuente | Visualizaciones | Procedencia local |
| --- | ---: | --- |
| Web ULP | 50.175 | `D:\ULP 2027\Wupp export\20261008-235241\stats.json`, campo `pageviews` |
| Linktree | 747 | `D:\ULP 2027\Estadísticas Linktree 2026-10-08\manifest.json`, `comprobaciones.vistas` |
| TikTok | 56.073 | Mismo manifiesto, `comprobaciones.tiktok_vistas`; 19 publicaciones |
| YouTube | 33.427 | Mismo manifiesto, `comprobaciones.youtube_vistas`; 19 vídeos |
| Total | 140.422 | Suma de los cuatro contadores anteriores |

Se usa exclusivamente la exportación completa más reciente de Wupp, sin sumar el primer intento de exportación. Tampoco se suman las filas mensuales a los resúmenes, ni los clics a las vistas. Los visitantes y las visitas de Umami son métricas diferentes de las páginas vistas.

La web presenta el resultado como **visualizaciones acumuladas**. Los periodos difieren entre plataformas y no hay deduplicación de personas. Instagram queda excluido porque sus contadores de vistas no están disponibles; un valor ausente no se convierte en cero. El desglose y las limitaciones se conservan en este documento; el componente público muestra solo las cuatro cifras, con sus etiquetas debajo y sin textos auxiliares. Utiliza los iconos people, controller, buildings y eye de Bootstrap Icons 1.13.1, descargados del repositorio oficial. Su licencia MIT se conserva en `docs/licencias/bootstrap-icons.txt`.

## Twitch

Vídeo más reciente disponible en la [lista pública ordenada por fecha](https://www.twitch.tv/ugr_lan_party/videos?filter=all&sort=time), comprobado el 15 de octubre de 2026: [Día 2 — IRL, torneos y entrega de premios, ULP 2026](https://www.twitch.tv/videos/2729691781), duración 13:16:35.

`src/data/latest-stream.json` centraliza el identificador, título, duración, miniatura y fecha de comprobación. Al publicar un nuevo vídeo, hay que actualizar este archivo y su imagen; la selección no se consulta automáticamente a Twitch. No se incorporan credenciales ni endpoints privados.

La miniatura local es un fotograma real de la retransmisión, alrededor de 01:00:04, capturado a 1920 × 1080 y servido en WebP con variantes de 360, 720 y 1280 px. La primera miniatura pública de Twitch mostraba la pantalla de espera, por eso se eligió un fotograma del evento.

El reproductor se crea al pulsar en la previsualización y recibe `parent` desde el dominio real del navegador. En espacios de menos de 400 px se abre el vídeo directamente en Twitch para respetar el tamaño mínimo del [reproductor oficial](https://dev.twitch.tv/docs/embed/video-and-clips/). El enlace externo sigue disponible y funciona sin JavaScript.

## Galería de colaboradores

`PartnerMoments.astro`, en `/participan`, muestra las cuatro imágenes elegidas por la organización. Se descargan y optimizan localmente para evitar depender de enlaces de imágenes que caducan.

| Archivo en `public/assets/participan/gallery` | Contenido | Fuente |
| --- | --- | --- |
| `colaboradores-stands-2025.webp` | Charla de Nazaríes, ULP 2025 | [Flickr 54744242270](https://www.flickr.com/photos/rotograber/54744242270/) |
| `colaboradores-charlas-2025.webp` | Encuentros con T-Systems, ULP 2025 | [Flickr 54744182373](https://www.flickr.com/photos/rotograber/54744182373/) |
| `colaboradores-2024.webp` | Stand de Nazaríes, ULP 2024 | [Flickr 53634340507](https://www.flickr.com/photos/rotograber/53634340507/) |
| `colaboradores-2026.webp` | Exposición retro, ULP 2026 | Imagen de LinkedIn facilitada por la organización; referencia `B4EZ0urT9qGwAM-`, subida `1774604599464` |

Las tres fotos de Flickr proceden de Rotograber. Se conservan sus enlaces para abrir las fotografías originales. La imagen de LinkedIn enlaza a la copia local para evitar un enlace temporal. El optimizador incluye la nueva carpeta y puede regenerar sus variantes.

## Cronograma y nombre del sitio

El cronograma, sin texto de instrucciones, enlaza las ocho ediciones documentadas entre 2016 y 2026. Representa 2020–2022 como un intervalo «Time-skip», sin inventar eventos. Desplazamiento horizontal en móvil, enlaces nativos y funcionamiento sin JavaScript.

El título principal, Open Graph, nombre de aplicación, manifiesto y datos estructurados `WebSite` utilizan «UGR LAN Party». Los canonicals apuntan al dominio público. Los datos estructurados se incluyen en el home según las [directrices de nombres de sitio de Google](https://developers.google.com/search/docs/appearance/site-names). Google decide el resultado final y necesita volver a rastrear la versión publicada.

## Trofeos y fondos

El visor ampliado usa un `dialog` nativo, conserva el mismo canvas y escena de Three.js y se adapta mediante el `ResizeObserver` existente. No duplica modelos ni contextos WebGL. Escape, botón de cierre, cierre desde el fondo y retorno de foco al botón. Mantiene los fondos y el funcionamiento automático del trofeo original.

El fondo decorativo de Maps en Contacto y Localización baja al 6 % de opacidad, con escala de grises y desenfoque de 2 px. Se mantiene el degradado de los cuatro bordes.

Validación de esta revisión: compilación de 47 páginas con Flickr activo, rutas y recursos correctos, 43 pruebas unitarias y 71 pruebas de navegador superadas. Revisión manual en ambos temas y cinco anchos entre 320 y 1440 px, reproducción real de Twitch y render WebGL ampliado. Los nueve álbumes conservan fotos en la compilación final.


Ajuste de presentación: cifras inmediatamente después de Encuentra tu partida, etiquetas debajo del número y sin desplegable ni textos auxiliares. La galería se sitúa al final de Participan. Twitch utiliza el titular «Vive el evento en directo» y el cronograma muestra «Time-skip» sin instrucciones. La ampliación del trofeo es un icono accesible en la esquina inferior derecha. Compilación, rutas y 23 pruebas de navegador de los componentes afectados correctas.
