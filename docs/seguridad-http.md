# Seguridad HTTP y revisión del repositorio

La imagen pública sirve archivos estáticos con Nginx. No ejecuta Node, Astro, APIs de inscripción ni un backend con datos personales. La compilación sí usa Node y obtiene fotos públicas de Flickr y perfiles públicos de GitHub. El contenido Markdown y los datos del programa forman parte del repositorio: sus autores tienen capacidad de cambiar el código y son una frontera de confianza.

## Cambios aplicados

- Clickjacking: `X-Frame-Options: DENY` y CSP `frame-ancestors 'none'`, con `always` para proteger también errores. Estas directivas regulan quién puede enmarcar la ULP, no los vídeos o mapas que incorpora la ULP.
- CSP limita además `base-uri`, `object-src` y el envío de formularios a la propia web. No es una política completa contra XSS: no se presenta como sustituto de validar entradas o escapar contenido. Se preservan Three.js, los estilos dinámicos, YouTube, Twitch y Google Maps.
- `nosniff`, política de referente y permisos mínimos para cámara, micrófono y geolocalización.
- Bloqueo de archivos ocultos, conservando `/.well-known/acme-challenge/`. La ruta `/version.json`, que define su propia cabecera de caché, vuelve a incluir la protección porque las cabeceras de Nginx no se heredan si un `location` declara sus propios `add_header`.
- Se oculta la versión de Nginx, se fija el digest de su imagen y se actualizan los paquetes de Alpine en la fase de ejecución. El escaneo inicial de esa base detectó ocho avisos corregibles en libexpat, libX11, libXpm y zlib; Trivy vuelve a analizar la imagen final y hace fallar CI si detecta avisos de vulnerabilidad. La fase de ejecución no contiene el repositorio, sus dependencias de compilación ni archivos `.env`.
- Astro se actualiza a 7.4.1. Se migran las colecciones de noticias y aviso legal a loaders y se mantiene Tailwind 3 mediante PostCSS, para conservar el diseño sin depender de una integración incompatible con Astro 7. Se actualizan los parsers afectados y esbuild.

## Dependencias sin versión corregida

`GHSA-vfj7-8cjw-p6xm` afecta al anidamiento extremo de patrones en `braces` 3.0.3, dependencia transitiva del watcher de Tailwind. El aviso no publica versión corregida en la fecha de esta revisión. `patches/braces@3.0.3.patch` limita la profundidad de llaves y paréntesis antes de construir árboles que luego se procesan recursivamente. Se aplica con `pnpm.patchedDependencies` durante instalaciones normales, CI y Docker.

`tests/security-dependencies.test.js` prueba las cuatro APIs con entradas de 4.000 niveles y comprueba que los globs habituales conservan su resultado. `pnpm audit` seguirá identificando la versión original de este paquete; no conoce el parche. `pnpm audit:security` ejecuta la regresión del parche y acepta únicamente ese aviso y esa versión. Cualquier aviso distinto o ausencia del parche hace fallar la auditoría. Hay que retirar el parche cuando exista un reemplazo oficial y validar de nuevo el watcher.

## Validación y alcance

`pnpm test`, `pnpm build`, `pnpm check:site`, `pnpm audit:security` y Playwright verifican el proyecto. El workflow Docker arranca el Nginx real y comprueba cabeceras y estados de portada, ficha, error, versión, archivos ocultos y ACME en la candidata y en la imagen de vuelta atrás. La comprobación se puede repetir con `node scripts/check-security-headers.mjs URL`.

Se revisan entradas de URL, consultas, Markdown, HTML inyectado, JSON embebido, enlaces, llamadas externas, secretos habituales y workflows. Las respuestas de Flickr limitan sus imágenes a HTTPS en `staticflickr.com`; los alias y textos dinámicos del DOM usan nodos de texto. Los formularios de inscripción se abren fuera de esta web y sus respuestas no se descargan al navegador desde el repositorio.

Esta revisión no demuestra ausencia universal de vulnerabilidades y no audita el sistema operativo, las credenciales de Docker, certificados o firewall del servidor. La protección real depende también del proxy público y debe comprobarse después de desplegar. No se incorpora el contenido de correos de la incidencia al repositorio.

Referencias: [OWASP: Clickjacking Defense](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html), [Nginx: herencia de cabeceras](https://nginx.org/en/docs/http/ngx_http_headers_module.html), [aviso de braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [migración de Astro](https://docs.astro.build/en/guides/upgrade-to/v7/).
