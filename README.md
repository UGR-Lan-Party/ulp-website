<p align="center">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-black.png?raw=True#gh-light-mode-only" width="350" height="350">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-white.png?raw=True#gh-dark-mode-only" width="350" height="350">
</p>

# ULP Website

Página web oficial de la UGR LAN Party.

## Instalación para desarrollo

La web usa Astro, Node **24.21.0 LTS** (`.nvmrc`) y **pnpm 10.34.7** (`packageManager`). CI y Docker usan esas mismas versiones. El único lockfile es `pnpm-lock.yaml`.

1. Instala la versión de Node indicada en `.nvmrc` con tu gestor de versiones.
2. Ejecuta `npm install --global pnpm@10.34.7`.
3. Instala con `pnpm install --frozen-lockfile`.
4. Ejecuta `pnpm dev` y abre la dirección que muestra Astro.

Antes de enviar cambios: `pnpm test` y `pnpm build`. Para regenerar imágenes: `pnpm images`; confirma sus variantes y el manifiesto. Consulta [imágenes](docs/imagenes.md) y [dependencias](docs/dependencias.md).

Los parches del entorno se actualizan juntos en `.nvmrc`, `package.json` y `Dockerfile`, tras repetir instalación, pruebas y compilación. No generes un segundo lockfile con npm.

## Producción con Docker

1. Primero, en tu entorno de desarollo, construye la imagen de Docker:

```bash
   docker build -t ulp-website:latest .

```

2. El contenedor generado es completamente autocontenido y usa un servidor de Nginx para servir los archivos, por tanto sólo queda ejecutar el contenedor:

```bash
   docker run -d -p 8080:80 ulp-website:latest
```

## Rutas de ediciones anteriores

Las equivalencias se mantienen en `src/data/legacy-redirects.js`. `/inscribete` y `/competiciones` llevan al catálogo de actividades. Las fichas antiguas solo redirigen cuando existe una equivalencia directa. Los juegos retirados, como VALORANT, FC 24 o Pokémon Showdown, muestran la página 404 con acceso al programa; no se redirigen a otro juego.

Astro genera páginas de redirección HTML para el sitio estático. El servidor debe servir `404.html` con estado 404 cuando una ruta no exista.

La identificación de versiones, las comprobaciones y la vuelta atrás se describen en [despliegue](docs/despliegue.md).
