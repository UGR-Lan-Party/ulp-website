# Imágenes adaptadas

`node scripts/optimize-images.mjs` regenera las variantes WebP y el manifiesto. Los originales se conservan en `public/assets`; los artículos ofrecen su descarga. `ResponsiveImage` reserva el espacio y permite indicar `sizes`, prioridad y carga. Al añadir una imagen a esas carpetas se debe regenerar y confirmar el manifiesto con sus variantes.

Medición local a 360 px, DPR 1, latencia de 100 ms y 200 kB/s: la imagen elegida por el navegador fue de 14.416 bytes en la portada con Flickr bloqueado, 16.870 bytes en la primera tarjeta del blog, 4.872 bytes en el horario y 28.364 bytes en la carta de ajedrez. Se comprobaron carga correcta y dimensiones en los cuatro recorridos. Son bytes de esas imágenes, no el peso total de la visita ni una medición de producción.

El cartel del blog de 2026 pasa de 33.530.951 bytes a 44.034 (360 px), 118.436 (720 px) o 251.740 (1280 px). La medalla de oro pasa de 8.224.754 a 18.172 o 34.050 bytes. Las dimensiones del original permiten conservar su relación de aspecto.

El GIF de la caja de premios ya estaba comentado y no se descargaba en el HTML actual. Se retira ese bloque inactivo y se genera una alternativa estática de 11.282/20.476 bytes por si se necesita; no se atribuye ese ahorro a una visita actual.

Los modelos 3D son un coste separado. Esta tarea no presenta el tamaño total de `dist` como peso de una página.


## Galerías y trofeos en móvil

Las vistas previas de los carruseles mantienen 4:3 con recorte centrado; el diálogo conserva la proporción completa. Se utiliza la URL de 1024 píxeles que devuelve Flickr cuando está disponible, sin construir URLs ni secretos de imagen. La foto grande se descarga y decodifica al ampliar; las fotos vecinas se precargan cerca del carrusel, con una caché acotada.

Los trofeos empiezan a cargar al abrir la ficha. El modelo y sus materiales se solicitan en paralelo. El bucle de renderizado se detiene cuando el trofeo no está visible o la pestaña está en segundo plano, sin retrasar su descarga inicial.


## Acabado ligero de trofeos

Los materiales Phong incorporan un realce de bordes dependiente del ángulo de visión y reflejos más contenidos. La modificación se aplica al shader del material en una única pasada, sin mapas de entorno, texturas nuevas, bloom ni posprocesado. Los materiales compartidos se preparan una sola vez y el render mantiene sus pausas fuera de pantalla y con la pestaña oculta.

Comparación local del shader activado/desactivado sobre el trofeo de Hacking: Edge sin interfaz, WebGL por SwiftShader, viewport 900 × 900 y 120 intervalos tras 30 frames de calentamiento. Ambas variantes: mediana 6,3 ms, percentil 95 de 6,4 ms y tres llamadas de dibujo por frame, sin errores de compilación. Esta prueba acotada no garantiza los mismos tiempos en todos los dispositivos.
