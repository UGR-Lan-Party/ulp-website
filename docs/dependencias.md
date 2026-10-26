# Dependencias y comprobaciones de seguridad

El proyecto usa Node 24.22.1 o posterior de la rama 24 LTS y pnpm 10.34.7, fijados en los archivos de configuración, CI y Docker. Astro se actualiza a 7.4.1 para incorporar las correcciones de seguridad pendientes de la rama 5. Tailwind 3.4.19 conserva los estilos existentes a través de PostCSS y Autoprefixer, sin la integración antigua de Astro. Las noticias y el aviso legal usan los loaders de contenido compatibles con la versión nueva.

Node 24.22.1 incorpora las correcciones de [seguridad de octubre de 2026](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases), incluida CVE-2026-111497 en el decodificador Brotli. `.nvmrc` y las imágenes Docker fijan esa versión; `engines.node` impide usar versiones anteriores.

Sharp sigue fijado a 0.35.5. El servicio de imágenes de Astro es `noop`: no se exponen endpoints de optimización ni un servidor Node en la imagen final. Los parsers CSS y esbuild se resuelven a versiones corregidas mediante overrides del lockfile. Se actualizan también las dependencias transitivas Undici 8.12.2 y fast-uri 3.1.9, con overrides limitados a los rangos vulnerables de sus respectivas ramas.

El único aviso de `pnpm audit` que permanece identificado por versión es `GHSA-vfj7-8cjw-p6xm` en braces 3.0.3. No tiene versión oficial corregida en esta revisión: se aplica un parche versionado que limita el anidamiento y se comprueba con entradas hostiles. `pnpm audit:security` valida ese parche y falla ante cualquier aviso adicional. No equivale a ocultar todas las alertas de una dependencia ni a afirmar que el paquete original esté corregido.

El contenedor de Nginx tiene digest fijado, actualiza los paquetes Alpine y se analiza con Trivy antes de publicar. No contiene las dependencias de Node de la fase de compilación. La construcción multietapa se ha comprobado localmente con Podman, además de las pruebas de CI de Docker.

Validación: instalación con `--frozen-lockfile`, auditoría, pruebas unitarias, `astro check`, compilación de las 47 páginas, integridad de rutas e imágenes, Playwright y verificación de las cabeceras en Nginx real. Los informes de una ejecución son una comprobación puntual: se deben repetir con nuevas alertas o al actualizar el lockfile y la imagen base.

El análisis y la excepción parcheada se detallan en [seguridad HTTP](seguridad-http.md). La aplicación de las cabeceras en el proxy de producción está en [servidor](servidor-seguridad.md).
