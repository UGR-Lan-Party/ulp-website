# Emparejamientos y resultados

## Qué muestra la web

`src/data/tournaments-2026.json` es una selección pública revisada el 15 de octubre de 2026. El componente `TournamentMatchups.astro` aparece en las trece competiciones del catálogo que tienen información de torneo. No aparece en actividades sin torneo ni inventa un cuadro para retos por puntuación.

- Ping pong: ocho grupos, 24 nicknames y 24 cruces de la hoja «Brackets», pestaña `FaseDeGrupos`, rangos A2:AE5 y A8:AD10. Los horarios son los previstos en el documento. No contiene marcadores ni la fase final. Se contrasta el formato con «FORMATO PING PONG», que concreta el reglamento general: grupos de tres, cuartos y semifinales BO3 y final BO5.
- Smash: 63 partidos públicos, con rondas, nicknames y marcadores, recuperados desde la [ficha de Smash Bros. Spain](https://smashbrosspain.com/torneos/ugr-lan-party-2026), organizador colaborador. La ficha enlaza el [cuadro oficial](https://smash.gg/tournament/ugr-lan-party-2026/event/ultimate-singles). Se representan por separado Top 16 y Top 40, en ganadores y repesca. Las conexiones solo siguen a un ganador que figura en otro partido posterior de la misma fase; no se deducen saltos entre cuadros ni se rellena con partidos ficticios.
- Mario Kart: veinte registros con alguna puntuación de ronda, tomados de H2:J141 de las inscripciones. No hay grupos de carrera confirmados. Una celda vacía se conserva como ausencia; un cero se mantiene como cero. No se calcula una clasificación final con datos incompletos.
- Minecraft: seis equipos de dos jugadores de la pestaña UHC y resultados de HG1/HG2/HG3 de «Puntuaciones Minecraft ULP 2026», A1:D40/A1:C40. UHC no contiene bajas ni posiciones; HG1 tiene una fila sin resultado. No se fabrica una clasificación general.
- Clash Royale: enlace al cuadro público indicado en «Clasificación Torneo». Challonge bloqueó la lectura automática, por lo que sus cruces no están incorporados. La planilla «Plantilla PingoPongo» es un formulario vacío para anotar tantos y no sirve como cuadro histórico.
- Resto de torneos: formato de las reglas y listas de alias/nombres de equipo de las inscripciones. La lista se identifica como inscripción, sin afirmar asistencia ni seeding. Los cruces permanecen pendientes de una fuente confirmada.

No se importan nombres completos, correos, teléfonos, contactos de Telegram/Discord, consentimientos ni marcas temporales de inscripción. Algunas celdas de StartGG mezclaban alias y correo: se extrae solo el alias. Se excluyen valores ambiguos que parecen nombres completos y marcadores vacíos. Las fuentes privadas no se consultan desde el navegador. El validador rechaza campos adicionales, correos y posibles teléfonos, pero la revisión humana de alias sigue siendo necesaria: una expresión regular no puede determinar si un nickname coincide con un nombre real.

Los originales de Drive se consultaron en modo lectura. La web utiliza una instantánea, no una sincronización activa. El tipo de cuadro y las reglas deben revisarse para 2027; no se heredan automáticamente las decisiones de 2026.

## Propuesta para automatizar 2027

Es viable mantener Google Forms y Sheets para el staff y publicar solo una proyección pública de los torneos. La opción encaja con la web estática actual y permite conservar Telegram como canal interno.

1. **Inscripción:** un activador instalable de envío de formulario registra o actualiza un participante con un identificador interno estable. Deduplica por una clave privada y valida equipo completo, nickname y campos requeridos. El orden de llegada no se convierte automáticamente en seeding.
2. **Revisión:** el staff confirma elegibilidad, equipo y asistencia. Las inscripciones nuevas actualizan una lista provisional, no reordenan encuentros que ya se han anunciado o jugado.
3. **Configuración:** una hoja privada por torneo define edición, versión de reglas, formato, plazas, equipos, grupos, BO de cada fase, desempates y estado. Al cerrar inscripción/check-in, una acción del staff congela participantes y genera una propuesta reproducible. Se conserva su semilla de sorteo y una versión de revisión.
4. **Resultados:** el staff registra marcadores. La aplicación valida el BO, los rivales y la ronda antes de avanzar al ganador. Los cambios sobre un partido finalizado requieren una corrección explícita y un registro de auditoría; nunca se regeneran las rondas posteriores silenciosamente.
5. **Publicación:** un servicio privado genera JSON exclusivamente con alias/equipos, rondas, marcadores y horarios públicos. El validador de la web se ejecuta antes de publicarlo. La página obtiene ese JSON público y puede refrescarlo de forma periódica, manteniendo la última versión válida si falla la conexión. No debe exponerse la hoja original ni una API key en el cliente.
6. **Telegram:** un bot puede avisar al grupo del staff de equipos incompletos, cuadro listo para revisión y resultados pendientes. Los avisos públicos solo contendrían nicknames; la gestión de datos personales sigue en la hoja privada. Esta integración no está activada ni se han enviado mensajes.

Un envío simultáneo de varios formularios debe usar `LockService` y operaciones idempotentes para evitar duplicar participantes o avances. Los activadores se ejecutan con la cuenta que los crea, por lo que conviene instalarlos con una cuenta de organización y documentar su mantenimiento. Los formularios enviados mediante scripts/API no disparan automáticamente el activador de envío; cualquier importación debe invocar explícitamente la misma lógica de validación. Una reconciliación periódica detecta fallos o reintentos.

### Adaptaciones por formato

| Competición | Reglas de 2026 que debe soportar el sistema |
| --- | --- |
| Ping pong | Grupos de tres todos contra todos; ocho clasificados; BO3 hasta semifinales y BO5 en final. |
| Clash Royale | Cinco rondas suizas BO1; semifinales y final BO5; desempates por victorias y torres según las reglas. Los rivales se calculan por resultados de cada ronda, no al inscribirse. |
| Smash | Doble eliminación. Conviene mantener start.gg como fuente de verdad y leer su cuadro, para conservar byes, repesca y posible reinicio de gran final correctamente. |
| Rocket League | Seeding por rango medio; dos grupos de cinco BO3; cuatro clasificados a playoffs BO5. |
| League of Legends | Tres grupos de cuatro BO1; primeros a semis, segundos a triangular; semis por sorteo y final BO1. |
| Brawl Stars | Cuatro grupos; ocho clasificados; cuartos y semis BO3, final BO5 y encuentro por tercer puesto. |
| Ajedrez | Suizo previsto o todos contra todos según participación; requiere una decisión de organización y un motor adecuado a los criterios de desempate aprobados. |
| Wii Sports Tenis | Tres rondas en grupos de sistema suizo, repesca y eliminatorias. Hay decisiones de formato que deben concretarse antes de generar cruces. |
| Wii Sports Bolos | Clasificación por puntuación: pasan 16, luego 8; seis lanzamientos en primeras fases, diez en final; desempate específico. |
| Mario Kart | Carreras de cuatro, pasan dos; después Gran Prix de cuatro carreras. No admite un generador 1 contra 1. |
| Minecraft | Parejas UHC y partidas HG; puntos por bajas y posición, con ponderaciones distintas. |
| Hacking | Clasificación por puntos y desempate por tiempo de la última flag según el reglamento; no un bracket. |
| Futbolín | Partidos por equipos a nueve bolas. Falta confirmar el sistema de cruces antes de automatizarlo. |

Para 2027 hay que confirmar los formatos y desempates con cada responsable antes de ponerlos en marcha. El sistema puede generar y validar propuestas, pero una regla ambigua o una decisión organizativa pendiente debe detener la publicación del cuadro.

### Documentación oficial consultada

- [Activadores instalables y eventos de Forms/Sheets](https://developers.google.com/apps-script/guides/triggers/installable).
- [LockService para impedir ejecuciones concurrentes incompatibles](https://developers.google.com/apps-script/reference/lock/lock-service).
- [Aplicaciones web de Apps Script y permisos de ejecución](https://developers.google.com/apps-script/guides/web).

Esta es una propuesta de arquitectura. No se han instalado activadores, cambiado permisos, publicado hojas ni configurado bots.
