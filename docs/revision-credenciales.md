# Revisión de credenciales

Revisión del 15 de octubre de 2026 sobre el árbol de trabajo, la salida compilada y los 449 commits alcanzables en las referencias locales del repositorio. Se inspeccionaron 256 archivos de texto actuales, 99 archivos de texto compilados y 1124 versiones históricas de archivos. También se revisaron la configuración Git local y las exclusiones de Git y Docker.

No se encontraron credenciales privadas en este alcance. La búsqueda combinó patrones de tokens, claves privadas, contraseñas, cabeceras de autenticación, conexiones con usuario y contraseña, asignaciones de claves y cadenas aleatorias, con clasificación posterior de las coincidencias. La revisión no garantiza detectar cualquier formato de secreto.

| Elemento | Resultado |
| --- | --- |
| Flickr | Clave pública de aplicación en `src/utils/flickr.js`. En el historial aparecen copias de la misma clave. No se encontró un secreto de aplicación ni un token OAuth. |
| Maps | Las ubicaciones usan una URL pública de mapa incrustado. No se encontró una clave de Google Maps API. |
| Umami / Wupp | El cliente incluye el identificador público del sitio. No se encontró una API key ni credenciales de administración. |
| Publicación Docker | El workflow obtiene las credenciales mediante referencias a GitHub Actions Secrets. No contiene valores de acceso. |
| Otros resultados | Versiones de dependencias y nombres de extensiones WebGL, sin datos de acceso. |

`.gitignore` excluye ahora todos los nombres `.env*`, dejando versionables las plantillas `.env.example` y `.env.sample`. `.dockerignore` ya excluía `.env*` y `.git` del contexto de construcción. No se modificaron las claves públicas ni el historial Git.

No se incluyen valores de claves, contraseñas ni tokens en este informe. La revisión se limita al repositorio y sus artefactos locales; no consulta almacenes de credenciales del equipo ni comprueba si las claves públicas están restringidas en sus proveedores.
