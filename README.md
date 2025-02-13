<p align="center">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-black.png?raw=True#gh-light-mode-only" width="350" height="350">
  <img align="center" src="https://github.com/chelunike/ulp-website/blob/master/public/assets/logo/logo-white.png?raw=True#gh-dark-mode-only" width="350" height="350">
</p>

# ULP Website

Página web oficial de la UGR LAN Party.

## Badges Importantes
![Web](https://img.shields.io/website?url=http%3A//ulp.ugr.es/)
![Lighthouse](https://img.shields.io/endpoint?url=<your-lighthouse-json>)
![Mozilla Observatory](https://img.shields.io/mozilla-observatory/grade/)

![performance](https://img.shields.io/badge/dynamic/json?label=Performance&query=$.categories.performance.score&url=https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${{secrets.SITE_URL}}&key=${{secrets.PSI_API_KEY}}&strategy=mobile&multiply=100&style=flat&logo=lighthouse&suffix=%)



          
          curl -o badges/accessibility.svg "https://img.shields.io/badge/dynamic/json?label=Accessibility&query=$.categories.accessibility.score&url=https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${{ secrets.SITE_URL }}&key=${{ secrets.PSI_API_KEY }}&strategy=mobile&multiply=100&style=flat&logo=lighthouse&suffix=%"
          
          curl -o badges/best-practices.svg "https://img.shields.io/badge/dynamic/json?label=Best%20Practices&query=$.categories.best-practices.score&url=https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${{ secrets.SITE_URL }}&key=${{ secrets.PSI_API_KEY }}&strategy=mobile&multiply=100&style=flat&logo=lighthouse&suffix=%"
          
          curl -o badges/seo.svg "https://img.shields.io/badge/dynamic/json?label=SEO&query=$.categories.seo.score&url=https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${{ secrets.SITE_URL }}&key=${{ secrets.PSI_API_KEY }}&strategy=mobile&multiply=100&style=flat&logo=lighthouse&suffix=%"


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
