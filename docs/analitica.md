# Clics de inscripción y reglamento

Se registran `registration-click` al salir a un formulario abierto y `rules-click` al abrir el reglamento desde una ficha. Los datos personalizados son únicamente `edition` (año) y `activity` (identificador del catálogo). El clic en el archivo o en el catálogo no se cuenta como inscripción.

Un único listener delegado llama a la API de Umami comprobada en el tracker servido por Wupp. No se añaden atributos `data-umami-event`, para evitar que el tracker registre el mismo clic por segunda vez. La API usa peticiones con `keepalive`; el enlace conserva su navegación nativa y no espera a la analítica.

El evento usa un contexto permitido de sitio, pantalla e idioma y la ruta sin parámetros ni fragmentos. No copia identificadores de usuario, datos previos, referencias con parámetros ni información del formulario. Esto describe estos eventos; no cambia el comportamiento de las visitas de página existentes.

En el panel de Wupp/Umami, seleccionar el sitio de ULP y un intervalo que incluya la prueba, abrir Eventos y filtrar por el nombre; contrastar las propiedades `edition` y `activity`. Un clic mide interés y salida al formulario, **no** inscripción completada ni asistencia. En 2026 cerrada no se muestra un enlace de inscripción y no debe generarse ese evento.

Las pruebas locales usan un tracker simulado, comprueban un único evento y mantienen los enlaces si Umami falta, lanza un error o rechaza su promesa. No se inyectan visitas o inscripciones de prueba en el panel de producción. Queda pendiente una comprobación real en el panel tras integrar y desplegar, usando una actividad y un período de inscripción confirmados.
