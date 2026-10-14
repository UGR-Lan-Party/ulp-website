# Desplegar y recuperar una versión

La imagen se identifica con `sha-COMMIT` y con la etiqueta OCI `org.opencontainers.image.revision`. `/version.json` permite comprobar el commit servido. `latest` se conserva por compatibilidad; para recuperar exactamente un artefacto se debe desplegar su **digest** `repositorio@sha256:...`, ya que una etiqueta del registro puede sobrescribirse.

La publicación en Docker Hub sigue limitada a los push a `master`. Las PR solo construyen y prueban, sin credenciales de publicación. El resumen del workflow registra el digest publicado. No se modifica producción al abrir esta PR.

## Antes de actualizar

Quien opera el alojamiento debe registrar el digest anterior, los puertos, red, volúmenes y configuración del proxy actuales. Conservar una copia de la configuración de despliegue con acceso restringido. Confirmar que el proxy termina HTTPS y reenvía al puerto 80 del contenedor; el Nginx interno sirve los archivos y no redirige al mismo dominio.

1. Descargar la candidata por digest con `docker pull REPOSITORIO@sha256:DIGEST_NUEVO`.
2. Arrancarla primero en un entorno de prueba con la configuración real del servicio y un puerto alternativo.
3. Ejecutar `node scripts/check-deployment.mjs URL_DE_PRUEBA COMMIT_ESPERADO` y comprobar `docker inspect` para su estado de salud.
4. Cambiar la referencia de imagen en la configuración del servicio de producción al digest probado y recrear el servicio con la herramienta de alojamiento habitual.
5. Repetir la comprobación sobre la URL pública. Mantener registrados commit, digest y resultado.

## Vuelta atrás

Restaurar en esa misma configuración el **digest anterior**, conservando puertos, redes, volúmenes y proxy. Recrear el servicio y comprobar la URL pública con el commit anterior esperado. No basta con volver a descargar `latest`.

CI ensaya la sustitución entre una imagen candidata y otra imagen de prueba identificada como `rollback-test`, y verifica portada, ficha y versión en ambas. Esto comprueba el contenedor; no demuestra que se haya ensayado la configuración concreta del alojamiento. Antes de cerrar la issue, operación debe ejecutar y registrar una vuelta atrás en su entorno de prueba. No se inventan el nombre del servicio ni los comandos del proveedor.

## Coordinación

Esta configuración incorpora la corrección necesaria de Nginx planteada en la PR #267 y añade resolución de directorios y página 404. Revisar ambas propuestas juntas antes de integrarlas para evitar cambios duplicados.
