# Imágenes adaptadas

`node scripts/optimize-images.mjs` regenera las variantes WebP y el manifiesto. Los originales se conservan en `public/assets`; los artículos ofrecen su descarga. `ResponsiveImage` reserva el espacio y permite indicar `sizes`, prioridad y carga. Al añadir una imagen a esas carpetas se debe regenerar y confirmar el manifiesto con sus variantes.

Medición local a 360 px, DPR 1, latencia de 100 ms y 200 kB/s: la imagen elegida por el navegador fue de 14.416 bytes en la portada con Flickr bloqueado, 16.870 bytes en la primera tarjeta del blog, 4.872 bytes en el horario y 28.364 bytes en la carta de ajedrez. Se comprobaron carga correcta y dimensiones en los cuatro recorridos. Son bytes de esas imágenes, no el peso total de la visita ni una medición de producción.

El cartel del blog de 2026 pasa de 33.530.951 bytes a 44.034 (360 px), 118.436 (720 px) o 251.740 (1280 px). La medalla de oro pasa de 8.224.754 a 18.172 o 34.050 bytes. Las dimensiones del original permiten conservar su relación de aspecto.

El GIF de la caja de premios ya estaba comentado y no se descargaba en el HTML actual. Se retira ese bloque inactivo y se genera una alternativa estática de 11.282/20.476 bytes por si se necesita; no se atribuye ese ahorro a una visita actual.

Los modelos 3D son un coste separado. Esta tarea no presenta el tamaño total de `dist` como peso de una página.
