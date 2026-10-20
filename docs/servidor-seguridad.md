# Aplicación en el proxy de producción

Configuración identificada con datos del operador: el contenedor `ulp-prod-nginx-1` publica 80 y 443 y monta `/home/ballenita/ulp-prod/nginx` en `/etc/nginx`. Su configuración persistente está en `/home/ballenita/ulp-prod/nginx/nginx.conf`. El contenedor `ulp-prod-ulp-1` sirve la web en su puerto 80 y publica además 8080 del host. No se necesita sudo para las operaciones Docker que el usuario ya puede ejecutar.

## Mitigación inmediata

Guardar copia del archivo y editarlo en el host, no mediante un cambio efímero dentro del contenedor:

```bash
cd /home/ballenita/ulp-prod
cp nginx/nginx.conf nginx/nginx.conf.bak-$(date +%Y%m%d-%H%M%S)
nano nginx/nginx.conf
```

Dentro del `server` de `listen *:443 ssl;` y `server_name ulp.ugr.es;`, añadir:

```nginx
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

Si un `location` tiene sus propios `add_header`, repetir la protección dentro de él o usar el include descrito abajo. No cambiar los certificados ni `proxy_pass`. Validar antes de recargar; si falla, corregir el archivo y conservar el proceso actual sin recarga:

```bash
docker exec ulp-prod-nginx-1 nginx -t &&
docker exec ulp-prod-nginx-1 nginx -s reload
curl -sI https://ulp.ugr.es/ |
grep -Ei '^(HTTP/|X-Frame-Options:|Content-Security-Policy:|X-Content-Type-Options:|Referrer-Policy:)'
curl -sI https://ulp.ugr.es/no-existe-seguridad
```

La segunda respuesta debe ser 404 y conservar DENY y frame-ancestors. Tras verificar las cabeceras públicas, el operador puede comunicar al CSIRC que se ha aplicado la mitigación y solicitar que confirme el cierre. La PR por sí sola no modifica producción.

## Configuración persistente coordinada con la imagen nueva

Desde un checkout de esta PR, copiar `security-headers.conf` a `/home/ballenita/ulp-prod/nginx/security-headers.conf` y `deploy/nginx/security-proxy.conf` a `/home/ballenita/ulp-prod/nginx/security-proxy.conf`. Sustituir las cuatro líneas de la mitigación manual por este include dentro del `server` HTTPS:

```nginx
include /etc/nginx/security-proxy.conf;
```

El snippet oculta las cabeceras equivalentes que pudiera devolver el upstream y añade una única política desde el proxy público. Así no se duplican al desplegar el nuevo contenedor de la web. Aplicar igualmente a cualquier bloque HTTP que sirva HTML; mantener intacta la ruta de renovación de certificados. No añadir HSTS con includeSubDomains sin comprobar antes el uso de HTTPS en los dominios afectados.

## Puerto 8080

La publicación `0.0.0.0:8080->80` y `[::]:8080->80` permite evitar el proxy si el firewall lo admite. Identificar el fichero Compose real sin mostrar variables ni secretos:

```bash
docker inspect --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}' ulp-prod-ulp-1
docker inspect --format '{{index .Config.Labels "com.docker.compose.service"}}' ulp-prod-ulp-1
```

En ese archivo, dentro del servicio de la web, retirar la publicación `8080:80` cuando el proxy se comunica por la red interna de Docker. Si se necesita para diagnósticos locales, cambiarla por `127.0.0.1:8080:80`. No cambiar la red ni la dirección del upstream. Desde el directorio de la configuración Compose, recrear únicamente el servicio confirmado:

```bash
docker compose up -d --no-deps ulp
docker ps --format 'table {{.Names}}\t{{.Ports}}'
curl -sI https://ulp.ugr.es/
```

Si Compose usa otro nombre de servicio o archivo, ajustar el comando a la salida de inspect; no usar un archivo nuevo ni perder la configuración existente. El acceso público debe continuar por 443. Descargar la imagen nueva y desplegarla siguiendo [despliegue](despliegue.md), conservando un digest anterior para recuperación. Después repetir la verificación de cabeceras y navegación por HTTPS.
