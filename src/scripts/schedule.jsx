import { useState, useEffect, useRef } from "preact/hooks";

const schedules = {
  "Brawl Stars": {
    aula: "B1",
    tags: ["Movil", "Competición"],
    eventos: [
      { time: "10:00 - 14:00", event: "Brawl Stars" }
    ]
  },
  "EA Sports FC 25": {
    aula: "A1",
    tags: ["Competición"],
    eventos: [
      { time: "10:00 - 14:30", event: "Fase Clasificatoria" },
      { time: "15:30 - 17:00", event: "Fase Final" }
    ]
  },
  "Futbolín": {
    aula: "Entrada",
    tags: ["Competición", "Aire Libre"],
    eventos: [
      { time: "10:00 - 14:00", event: "Fase Clasificatoria" },
      { time: "16:00 - 18:00", event: "Final" }
    ]
  },
  "League of Legends": {
    aula: "B1",
    tags: ["PC", "Competición"],
    eventos: [
      { time: "10:00 - 15:00", event: "Fase de Grupos" },
      { time: "18:00 - 19:00", event: "Semifinal I" },
      { time: "19:00 - 20:00", event: "Semifinal II" },
      { time: "20:30 - 21:30", event: "Final" }
    ]
  },
  "Mario Kart 8 Deluxe": {
    aula: "-1.1 y -1.2",
    tags: ["Competición", "Switch"],
    eventos: [
      { time: "17:00 - 20:00", event: "Fase Clasificatoria" },
      { time: "20:00 - 21:00", event: "Final" }
    ]
  },
  "Minecraft: Hunger Games": {
    aula: "B1",
    tags: ["PC"],
    eventos: [
      { time: "15:30 - 18:00", event: "Minecraft" }
    ]
  },
  "Ping Pong": {
    aula: "Bajo",
    tags: ["Competición", "Aire Libre"],
    eventos: [
      { time: "10:00 - 14:30", event: "Fase Clasificatoria" },
      { time: "15:30 - 16:30", event: "Final" }
    ]
  },
  "Rocket League 2vs2": {
    aula: "A2",
    tags: ["Competición", "PC"],
    eventos: [
      { time: "15:30 - 18:00", event: "Fase Eliminatoria" },
      { time: "18:00 - 19:00", event: "Final" }
    ]
  },
  "Super Smash Bros Ultimate": {
    aula: "-1.2",
    tags: ["Competición", "Switch"],	
    eventos: [
      { time: "10:00 - 14:30", event: "Fase de Grupos" },
      { time: "15:30 - 18:30", event: "Fase Eliminatoria" },
      { time: "18:30 - 19:30", event: "Final" }
    ]
  },
  "Valorant": {
    aula: "A2",
    tags: ["PC", "Competición"],
    eventos: [
      { time: "10:00 - 15:00", event: "Fase de Grupos" },
      { time: "17:30 - 18:30", event: "Semifinal I" },
      { time: "18:30 - 19:30", event: "Semifinal II" },
      { time: "19:30 - 20:30", event: "Final" }
    ]
  },
  "Wii Sports: Bolos": {
    aula: "-1.1 y -1.2",
    tags: ["Wii Sports", "Competición"],
    eventos: [
      { time: "10:00 - 14:00", event: "Wii Sports: Bolos" }
    ]
  },
  "Wii Sports: Tennis": {
    aula: "A1",
    tags: ["Wii Sports", "Competición"],
    eventos: [
      { time: "17:00 - 20:00", event: "Fase Clasificatoria" },
      { time: "20:00 - 21:00", event: "Final" }
    ]
  }
};


const allTags = [...new Set(Object.values(schedules).flatMap(game => game.tags))]; // Obtener todas las etiquetas únicas

export default function Schedule() {
  const [selectedGame, setSelectedGame] = useState("League of Legends");
  const [searchQuery, setSearchQuery] = useState(""); // Definir el estado de búsqueda

  const [isActive, setIsActive] = useState(false); // Estado para manejar el cambio de color del icono
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para el desplegable
  const dropdownRef = useRef(null); // Referencia para cerrar el desplegable al hacer clic fuera
  const filterButtonRef = useRef(null); // Referencia para el botón de filtro
  const [selectedTags, setSelectedTags] = useState([]); // Array para manejar los tags seleccionados



  const handleFilterClick = () => {
    console.log("Filtro activado");
    setIsActive(!isActive); // Alternar entre activo e inactivo
    setIsDropdownOpen(!isDropdownOpen); // Alternar la visibilidad del desplegable
  };

  // Cerrar el desplegable si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsActive(false); // Alternar entre activo e inactivo
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Manejo de cambios en los filtros
   const handleTagToggle = (tag) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );

    setIsDropdownOpen(false); // Cerrar el desplegable al seleccionar un tag
    setIsActive(false); // Alternar entre activo e inactivo
  };

  // Eliminar un filtro
  const removeTag = (tag) => {
    setSelectedTags(prevTags => prevTags.filter(t => t !== tag));
  };


  // Función para manejar el cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtrar juegos por búsqueda y tags seleccionados
  const filteredGames = Object.keys(schedules).filter((game) => {
    // Filtrar por búsqueda
    const matchesSearch = game.toLowerCase().includes(searchQuery.toLowerCase());

    // Si no hay tags seleccionados, muestra todos los juegos
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => schedules[game].tags.includes(tag));

    // El juego debe cumplir ambas condiciones: búsqueda y tags
    return matchesSearch && matchesTags;
  });
  


  return (

    <section id="schedule" class="relative z-10 overflow-hidden bg-primary py-20 lg:py-[115px]">
      <h1>Cronograma de Actividades</h1>
      <p className="subtext">No es necesario que asistas todo el día. Puedes venir para las actividades que más te interesen.</p>

      {/* Buscador */}
      <div>
        <input class="buscador" type="text" placeholder="Buscar juego..." value={searchQuery} onInput={(e) => setSearchQuery(e.target.value)}/>
        <button className="button-filter" ref={filterButtonRef} onClick={() => handleFilterClick()}>
          {/* Icono de filtro usando FontAwesome */}
          <i className="fa fa-filter" style={{ color: isActive ? '#D1A000FF' : '#ffffff'}}></i>
        </button>

        {/* Desplegable de filtros */}
        {isDropdownOpen && (
          <div ref={dropdownRef} className="filter-option" >
          {allTags.map(tag => (
            <button key={tag} className={`tag ${selectedTags.includes(tag) ? "selected" : ""}`} onClick={() => handleTagToggle(tag)}>
              {tag}
            </button>
          ))}
          </div>
        )}
      </div>

      {/* Mostrar filtros activos */}
      <div className="active-filters">
        {selectedTags.map(tag => (
          <button
            key={tag}
            className="active-filter"
            onClick={() => removeTag(tag)}
          >
            {tag} <i className="fas fa-times remove-filter"></i>
          </button>
        ))}
      </div>

      <div className="schedule">
      {/* Juegos */}
      <div className="games">
        {filteredGames.map((game) => (
          <button
            key={game}
            className={selectedGame === game ? "selected" : ""}
            onClick={() => setSelectedGame(game)}
          >
            {game}
            <span className="location">{schedules[game].aula}</span> {/* Muestra el aula correcta */}
          </button>
        ))}
      </div>

      {/* Horarios */}
      <div className="times">
        {schedules[selectedGame]?.eventos.map(({ time, event }) => (
          <div key={time} className="time-slot">
            <span className="time">{time}</span>
            <span className="event">{event}</span>
          </div>
        ))}
      </div>

    </div>

    <div class="tabla" style="margin: 0 5%">
      <img src="/assets/local_horarios/cronograma.svg" alt="imagen del cronograma" class="object-cover object-center w-full h-full" />
    </div>
    
      <style>
      <link href="https://fonts.googleapis.com/css2?family=Fragment+Mono&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet"/>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet"/>
        {`
          /* Estilos Generales */
          #schedule {
            background: #004465;
            color: white;
            text-align: center;
            margin: 0; /* Eliminar cualquier margen en el contenedor principal */
          }

          h1 {
            font-family: 'Inter', sans-serif;
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }

          .subtext {
          font-family: 'Fragment Mono', sans-serif;
            font-size: 1rem;
            opacity: 0.8;
            margin-bottom: 25px;
          }

          /*Buscador*/
          .buscador{
            padding: 8px 12px;
            fontSize: 1rem;
            marginTop: 10px;
            width: 50%;
            borderRadius: 5px;
            border-radius: 10px;
            color: #333;
          }

          .button-filter {
            padding: 8px 12px;
          } 

          .fa-filter {
            position: relative;
            cursor: pointer
          }

          .filter-option {
            position: absolute;
            left: 65%;
            zIndex: 10;
            width: 20%;
            padding: 10px;
            textAlign: left;
            border: none;
            fontSize: 14px;
            color: #333
          }

          .tag{
            background: white;
            border-radius: 5px;
            border: none;
            padding: 5px;
            margin-bottom: 5px;
            width: 100%;
            textAlign: left;
            cursor: pointer;
            color: #333
          }

          .tag:hover {
            transform: scale(1.05);
          }

          .tag .selected{
            background: red;
            color: #011627;
          }

          .active-filters {
            padding-top: 10px;
            display: flex;
            flex-direction: row;
            justify-content: center;  /* Centra los filtros de izquierda a derecha */
            align-items: center;      /* Centra los filtros de arriba a abajo */
            flex-wrap: wrap;          /* Asegura que los filtros se ajusten al espacio si es necesario */
            gap: 10px;                /* Espacio entre los botones de filtros */
          }

          .active-filter{
            background: rgba(42, 112, 146, 0.6);
            border-radius: 5px;
            padding: 10px;
            textAlign: center;
            cursor: pointer;
            color: #ffffff
          }

          /* Contenedor del Horario */
          .schedule {
            display: flex;
            justify-content: space-x-2;
            width: 80vw;
            margin: 0 auto;
            padding-top: 30px;
          }

          /* Lista de Juegos */
          .games {
            font-family: 'Inter', sans-serif;
            display: grid;
            grid-template-columns: repeat(2, 1fr); /* Crear 2 columnas iguales */
            gap: 12px;
            margin: 0;
            padding-left: 0;
          }

          .games button {
            background: rgba(42, 112, 146, 0.6);
            color: white;
            font-size: 1.2rem;
            padding: 15px 20px;
            border-radius: 10px;
            cursor: pointer;
            text-align: left;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            transition: all 0.3s ease-in-out;
            user-select: none; /* Deshabilitar selección de texto */
          }

          .games button:hover {
            transform: scale(1.05);
          }

          .games .selected {
            background: #ffffff;
            color: #011627;
          }

          .location {
            padding-left: 20px;
            font-family: 'Fragment Mono', sans-serif;
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 4px; /* Añadir un pequeño margen entre el botón y el texto */
          }

          /* Horarios */
          .times {
            display: flex;
            padding: 0 20px;
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .time-slot {
            display: flex;
            justify-content: space-between;
          }

          .time {
            font-family: 'Fragment Mono', sans-serif;
            padding:0.5rem;
            font-size: 1rem;
            padding-right: 1rem; /* Un poco de espacio entre la hora y la línea */
            border-right: 1px solid rgba(255, 255, 255, 0.5); 
          }

          .event {
            padding-left: 1rem; /* Un poco de espacio entre la línea y el evento */
            font-family: 'Inter', sans-serif;
            font-size: 1.5rem;
            font-weight: bold;
            text-align: right;
          }

          .tabla{
            padding-top: 50px; 
          }
          /* Responsive */
          @media (max-width: 768px) {
            .schedule {
              flex-direction: column;
              align-items: center;
            }

            /* Cambiar la dirección de los juegos a horizontal en pantallas pequeñas */
            .games {
              display: flex;
              flex-direction: row; /* En pantallas pequeñas se alinean horizontalmente */
              overflow-x: auto; /* Permitir el desplazamiento horizontal */
              overflow-y: hidden; /* Ocultar la barra de desplazamiento vertical */
              -ms-overflow-style: none;  /* Ocultar barra de desplazamiento en IE */
              scrollbar-width: none; /* Ocultar barra de desplazamiento en Firefox */
              gap: 12px;
              white-space: nowrap; /* Evitar que se ajusten en múltiples líneas */
              width: 100%; /* Asegurarse de que ocupe el ancho completo */
              padding-bottom: 10px; /* Añadir un poco de espacio para el scroll */
              user-select: none; /* Deshabilitar selección de texto */
              cursor: grab; /* Cambiar el cursor a "agarrar" para indicar que se puede arrastrar */
            }

            /* Estilo de las barras de desplazamiento */
            .games::-webkit-scrollbar {
              width: 0;  /* Eliminar el ancho de la barra de desplazamiento */
              height: 0; /* Eliminar la altura de la barra de desplazamiento */
            }
            .games button {
              width: 350px; /* Aumentar el tamaño de los botones */
              flex-shrink: 0; /* Evitar que los botones se encojan */
            }

            .times {
              padding: 30px;
              width: 100%;
              text-align: center;
            }

            .time-slot {
              width: 100%;
              justify-content: space-between;
              gap: 10px;
            }
          }
        `}
      </style>

    </section>
  );
}
