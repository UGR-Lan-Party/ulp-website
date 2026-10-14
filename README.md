<p align="center">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-black.png?raw=True#gh-light-mode-only" width="350" height="350">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-white.png?raw=True#gh-dark-mode-only" width="350" height="350">
</p>

# ULP Website

Página web oficial de la UGR LAN Party.

## Instalación para desarrollo

La página web usa la herramienta [Astro](https://astro.build/). Para poder usarla en el entorno de desarollo, sigue los siguientes pasos:

1. Descarga [NodeJS](https://nodejs.org/en) >= 19, recomendamos usar un gestor de versiones como [Volta](https://volta.sh/) o [NVM](https://github.com/nvm-sh/nvm).

1. Instala las dependencias con `npm install`, `pnpm install` o equivalente.

1. Ejecuta el scipt de servidor de desarrollo `dev`, via `npm run dev`, `pnpm dev` o equivalente.

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
