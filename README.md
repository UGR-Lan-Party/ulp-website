<p align="center">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-black.png?raw=True#gh-light-mode-only" width="350" height="350">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-white.png?raw=True#gh-dark-mode-only" width="350" height="350">
</p>

# ULP Website

[Página web oficial de la UGR LAN Party](https://ulp.ugr.es)


![Chromium HSTS preload](https://img.shields.io/hsts/preload/ulp.ugr.es)
![Mozilla HTTP Observatory Grade](https://img.shields.io/mozilla-observatory/grade-score/ulp.ugr.es)

[Performance](https://googlechrome.github.io/lighthouse/viewer/?gist=521d3ce3747c754c1b80dcae048bf21f)


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
