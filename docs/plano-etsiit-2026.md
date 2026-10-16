# Planos interactivos de la ETSIIT

La fuente de organización es `G:\Mi unidad\ULP\01 Diseños\Plano\Plano ULP 2026`. Se han inventariado 15 documentos: ocho PNG, seis PSD y un PDF técnico. Los archivos originales permanecen intactos.

## Referencias revisadas

- `Plano ETSIIT.png`: esquema general triangular, acceso al edificio, auditorio, escaleras, aulas −1.1/−1.2 y prefabricadas A1/A2/B1/B2. Referencia principal del contorno vectorial.
- `Plano Edificio Principal - Planta 0.png` y su variante transparente: hall, zona VR, puestos de juegos, sala de juntas, streaming y Salón de Grados.
- `Plano Edificio Principal - Planta Baja.png` y su variante transparente: cafetería, Salón de Actos, escaleras y sala de estudio.
- `Plano Aula -1.1.png`, `Plano Aula -1.2.png` y `Plano Aulas -1.1 y -1.png`: detalle de las aulas inferiores.
- Cuatro PSD del edificio, incluidas las versiones de color, de 4000 × 3500 px; PSD de las aulas inferiores de 4000 × 2500 px y de las prefabricadas de 6000 × 2500 px. Se comprueba el formato de las fuentes editables; el prototipo no depende de Photoshop ni convierte sus capas automáticamente.
- `02_INFORMAT_PB_2013_07_21 Model (1).pdf`: una página técnica vectorial, sin texto extraíble, con 4692 líneas y 2011 curvas. Se revisa su render como contraste del edificio; la densidad del plano no se traslada literalmente a la interfaz.

## Vistas por edificio y planta

El edificio principal dispone de planta 0 y planta baja, con contornos, salas y mobiliario separados. Las aulas −1.1/−1.2 se muestran en otra vista. Las prefabricadas A y B también tienen vistas independientes. Los SVG de `src/components/VenueFloorPlans.astro` interpretan las referencias; no se usan los PNG como fondos opacos ni se importan capas de Photoshop en el navegador.

En B1 se representa la distribución del PSD. Para B2 se conserva el recinto identificado en el plano general, sin inventar una distribución interior de mesas que no aparece en las referencias. No tiene actividades asignadas en el programa actual.

## Modelo y correspondencia

`src/data/venue-map.ts` define los cinco planos, sus zonas y sus coordenadas. `getVenueZones` relaciona las ubicaciones del programa con una o varias zonas. Cafetería y bajo de cafetería son zonas distintas. La entrada al patio se consulta en el contexto de la planta 0 y el exterior bajo cafetería en el de la planta baja.

Los horarios y sus ubicaciones proceden de `program-2026.json`. Los esquemas de mobiliario son referencias visuales; no modifican esos datos. La Sala de Profesores Externos continúa pendiente de situar. La correspondencia entre Sala de Estudiantes y el espacio de estudio de la referencia debe confirmarse con organización.

## Orientaciones e indicadores

Cada planta tiene cuatro estados, separados por 90 grados. `getVenueLayout` genera veinte configuraciones estables y mantiene los rótulos sin girar. Los puntos pertenecen a sus salas; los indicadores se ordenan por lado y altura para evitar intersecciones. La disposición no cambia al ocultar un resultado mediante filtros.

Durante el giro, las líneas se desvanecen antes de mover el plano y reaparecen después de aplicar la configuración nueva. No se arrastran líneas de un estado a otro. Movimiento reducido aplica directamente el estado final. Un arrastre horizontal avanza un único estado al soltar; también hay controles nativos y teclado.

## Presentación y funcionamiento

Solo el formulario de filtros utiliza el panel azul. El plano ocupa todo el ancho disponible y hereda los colores de la web: beige claro y azul en tema claro, fondo oscuro y trazos claros en tema oscuro. Se retira la columna de actividades duplicada; la tabla inferior conserva ese listado y está desplegada por defecto, también sin JavaScript.

Los selectores de edificio y planta permiten explorar las ubicaciones del programa. Al filtrar, los indicadores y sus contadores se sincronizan con las filas visibles, y se abre una planta que tenga coincidencias cuando la actual no las tiene. Pulsar una zona filtra la tabla; «Ver todas las zonas» recupera el resto de resultados. Las actividades sin posición confirmada mantienen su ubicación escrita en la tabla.

### Correcciones tras contrastar los originales

Se abre el arco del hall que se había dibujado como un círculo cerrado. Se rectifican particiones, accesos, escalera y conexiones del Salón de Actos. Las posiciones, dimensiones y giros del mobiliario del edificio principal se miden sobre las áreas de mobiliario de los PNG de 4000 × 3500, normalizadas a 1000 × 875, y se almacenan en `src/data/venue-furniture.json`. Se excluyen rótulos y el contorno decorativo de la zona VR para que no aparezcan como muebles.

En las aulas inferiores se eliminan paredes envolventes que no estaban en la referencia y se corrigen anchuras y alturas de mesas, columnas, proyectores y puestos laterales. Las prefabricadas reproducen las tres columnas de seis filas de A1 y las dos columnas de siete filas de A2/B1 del PSD, con tamaños de mesas y sillas separados. Los recintos orientativos se diferencian mediante un trazo discontinuo tenue; no representan muros medidos. Se usan remates y uniones redondeados en todos los trazos, además de esquinas suaves en el mobiliario.

El programa oficial conserva su propio desplegable cerrado inicialmente y su experiencia de scroll. La tabla de agenda es un desplegable independiente abierto inicialmente.

## Validación

Las pruebas recorren las cinco plantas y cuatro orientaciones, verifican que los puntos permanecen dentro del área visible y que las líneas no se cruzan. Las pruebas de navegador cubren filtros, resultados de varias aulas, apertura automática del plano correspondiente, estados de giro, movimiento reducido, ambos temas y anchuras de 320 y 390 px.

## Ajustes del 16 de octubre

Se retira el indicador de entrada principal de la planta 0; las ubicaciones escritas de la agenda permanecen disponibles en la tabla. Se ensancha la delimitación del Salón de Grados conforme al PNG para contener las sillas de la columna derecha; las sillas laterales conservan su orientación vertical. Mesas y sillas utilizan superficies con degradados suaves y más contraste, manteniendo dimensiones y proporciones. Se elimina el aviso de actividad pendiente de situar y se conserva su ubicación escrita en la tabla. El control de la agenda pasa a «Desplegar agenda» y aumenta su tamaño.
