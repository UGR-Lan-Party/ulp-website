import {schedules} from "../components/ActividadesSection.astro"
import "../components/ActividadesSection.astro"
let selectedGames = new Set();
const normalizedSchedules = normalizeSchedules(schedules);
const aulas = getUniqueAulas(normalizedSchedules);
const times = getUniqueTimes(normalizedSchedules);

document.addEventListener("DOMContentLoaded", () => {
    renderTable();
    const allTags = document.querySelectorAll(".tag");
    let showFiltersDropDown = false;
    let selectedTags = [];

    const buttonFilter = document.getElementById("filterButton");
    const iconFilter = document.getElementById("filterIcon");

    const filterDropDown = document.getElementById("filterDropdown");
    const activeFilters = document.getElementById("activeFilters");

    const gameButtons = document.querySelectorAll(".game");
    const gameInfo = document.getElementById("gameInfo");

    const isDarkMode = document.documentElement.classList.contains("dark");
    iconFilter.style.color = showFiltersDropDown ? "#D1A000" : (isDarkMode ? "white" : "black");


    function updateIconColor() {
        const isDarkMode = document.documentElement.classList.contains("dark");
        iconFilter.style.color = showFiltersDropDown ? "#D1A000" : (isDarkMode ? "white" : "black");
    }
    
    // Observador de cambios en la clase del <html>
    const observer = new MutationObserver(() => updateIconColor());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    // También actualizar cuando `showFiltersDropDown` cambie (esto depende de cómo lo manejas en tu código)
    document.addEventListener("DOMContentLoaded", updateIconColor);

    // Manejo de cambios en los filtros
    function handleTagToggle(event) {
        const isDarkMode = document.documentElement.classList.contains("dark");
        const tag = event.target.textContent;  // Obtener el texto del botón
        showFiltersDropDown = false;
        iconFilter.style.color = showFiltersDropDown ? "#D1A000" : (isDarkMode ? "white" : "black");
        filterDropDown.style.visibility = showFiltersDropDown ? "visible" : "hidden";
    
        if (selectedTags.includes(tag)) {
            // Si ya está seleccionada, la eliminamos
            selectedTags = selectedTags.filter(t => t !== tag);
        } else {
            // Si no está seleccionada, la agregamos al array
            selectedTags = [...selectedTags, tag];
        }

        console.log(selectedTags);

        updateSelectedTagsUI();
    };

    function updateSelectedTagsUI() {
    
        // Limpiar el contenedor antes de agregar los nuevos botones
        activeFilters.innerHTML = '';
    
        // Crear un botón para cada etiqueta seleccionada
        selectedTags.forEach(tag => {
            const button = document.createElement("button");
            button.textContent = tag;  // El texto del botón es la etiqueta
            button.classList.add("active-filter");

            // Puedes agregar una acción al botón si lo deseas
            button.addEventListener("click", () => {
                // Eliminar la etiqueta de 'selectedTags'
                selectedTags = selectedTags.filter(t => t !== tag);
                
                // Actualizar la interfaz
                updateSelectedTagsUI();
            });

            const cross = document.createElement("i");
            cross.classList.add("cross");
    
            // Agregar el botón al contenedor
            activeFilters.appendChild(button);
            button.appendChild(cross);
        });

        filterGames();
    }

    function filterGames(){
        const searchQuery = searchInput.value.toLowerCase();

        gameButtons.forEach(game => {
            const gameName = game.dataset.name.toLowerCase();
            const gameTags = game.dataset.tags.trim().toLowerCase().split(",");

            // Verificar si el nombre del juego coincide con la búsqueda
            const matchesSearch = gameName.includes(searchQuery);
            // Verificar si el juego tiene la etiqueta seleccionada (o ninguna si no se seleccionó ninguna etiqueta)
            const matchesTag = selectedTags.length === 0 || selectedTags.some(tag => gameTags.includes(tag.toLowerCase()));


            // Mostrar el botón solo si coincide con ambos filtros
            if (matchesSearch && matchesTag) {
                game.style.display = "flex";
            } else {
                game.style.display = "none";
            }
        });
    }

    

    // Añadir event listener al campo de búsqueda
    searchInput.addEventListener("input", filterGames);



    buttonFilter.addEventListener("click", () => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        showFiltersDropDown = !showFiltersDropDown;
        iconFilter.style.color = showFiltersDropDown ? "#D1A000" : (isDarkMode ? "white" : "black");


        filterDropDown.style.visibility = showFiltersDropDown ? "visible" : "hidden";
    });

    // Añadir un event listener a cada tag
    allTags.forEach(tag => {
        tag.addEventListener("click", handleTagToggle);
    })

function handleGameClick(event) {
  const button = event.currentTarget;
  const gameName = button.dataset.name;

  if (selectedGames.has(gameName)) {
    selectedGames.delete(gameName);
    button.classList.remove("selected");
  } else {
    selectedGames.add(gameName);
    button.classList.add("selected");
  }

  applyScheduleFilter();

  // Info lateral (opcional)
  if (selectedGames.size === 1) {
    showGameInfo(
      schedules.find(g => g.name === gameName)
    );
  } else {
    gameInfo.innerHTML = "";
  }
}


    // Asignar el evento "click" a cada juego en el HTML
    document.querySelectorAll(".game").forEach(button => {
        button.addEventListener("click", handleGameClick);
    });

    document.querySelector(".game").click();

    const style = document.createElement('style');
    style.innerHTML = `

        .active-filter {
            background-color: rgba(42, 112, 146, 0.6);
            color: white;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
        }


        .dark .time-slot {
            color: white;
        }

        .dark .time {
            border-color: white;
        }

        .event {
            font-family: 'Inter', sans-serif;
            font-size: 1.2rem;
            font-weight: bold;
            text-align: right;
            padding-left: 1rem;
            margin-top: 0.2rem;
        }


        @media (max-width: 800px) {

            .event {
                font-size: clamp(0.9rem, 4vw, 1rem); /* Reducir aún más en pantallas muy pequeñas */
                margin-top: 0.2rem;
            }

        }

        @media (max-width: 500px) {

            .event {
                font-size: clamp(0.8rem, 2vw, 1rem); /* Reducir aún más en pantallas muy pequeñas */
                margin-top: 0.3rem;
            }
        }
/* =========================
   TABLA CRONOGRAMA
========================= */

table.cronograma {
  width: 100%;
  border-collapse: separate !important;
  border-spacing: 0;
  background-color: #002b36;
  color: white;
  font-family: sans-serif;
  font-size: 12px;
}

/* =========================
   BORDES (Tailwind override)
========================= */

table.cronograma th,
table.cronograma td {
  border-width: 0px !important;
  border-style: solid;
  border-color: #ffffff;
  padding: 0;
  vertical-align: top;

}

/* Bordes exteriores */
table.cronograma thead tr:first-child th {
  border-top-width: 0px;
}

table.cronograma tr th:first-child,
table.cronograma tr td:first-child {
  border-left-width: 0px;
}

/* =========================
   CABECERA Y COLUMNA HORA
========================= */

table.cronograma thead th{
  background-color: #001f27;
  text-align: center;
  font-weight: bold;
  padding: 10px;
  width: 80px;
}
  table.cronograma .sticky {
  background-color: #013844;
  text-align: center;
  font-weight: bold;
  padding: 10px;
  width: 80px;
}


/* =========================
   CUERPO
========================= */

table.cronograma td {
  background-color: #013844;
  height: 42px;
}


/* =========================
   BLOQUES DE JUEGO
========================= */

table.cronograma .bloque {
  margin: 4px;
  height: auto; 
  min-height: 100%;
  padding: 8px;
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 6px;
  font-weight: 600;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Hover */
table.cronograma .bloque:hover {
  filter: brightness(1.15);
  transform: scale(1.02);
}

/* =========================
   COLORES POR JUEGO
========================= */

[data-game="Brawl Stars"] {
  background-color: #ffd966;
  color: #333;
}

[data-game="EA Sports FC 25"] {
  background-color: #93c47d;
  color: #111;
}

[data-game="Valorant"] {
  background-color: #e06666;
  color: white;
}

[data-game="Super Smash Bros Ultimate"] {
  background-color: #f6b26b;
  color: #111;
}

[data-game="Rocket League 2vs2"] {
  background-color: #6fa8dc;
  color: white;
}

[data-game="Minecraft: Hunger Games"] {
  background-color: #b4a7d6;
  color: #111;
}

[data-game="Wii Sports: Bolos"],
[data-game="Wii Sports: Tennis"] {
  background-color: #bf9000;
  color: white;
}

[data-game="Futbolín"] {
  background-color: #76a5af;
  color: white;
}

[data-game="League of Legends"] {
  background-color: #45818e;
  color: white;
}

[data-game="Mario Kart 8 Deluxe"] {
  background-color: #a64d79;
  color: white;
}


    `;

document.head.appendChild(style);
});
function normalizeSchedules(schedules) {
  return schedules.flatMap(game => {
    return game.eventos.flatMap(ev => {
      return game.aula.split(" y ").map(aula => ({
        time: ev.time,
        place: aula.trim(),
        name: game.name,
        event: ev.event,
      }));
    });
  });
}
function applyScheduleFilter() {
  const rows = document.querySelectorAll("#tbody tr");

  rows.forEach(row => {
    let rowHasVisibleBlock = false;

    row.querySelectorAll(".bloque").forEach(bloque => {
      if (
        selectedGames.size > 0 &&
        selectedGames.has(bloque.dataset.game)
      ) {
        bloque.style.display = "block";
        rowHasVisibleBlock = true;
      } else {
        bloque.style.display = "none";
      }
    });

    // 👇 mostrar la hora SOLO si tiene algún bloque visible
    row.style.display =
      selectedGames.size === 0
        ? "none"
        : rowHasVisibleBlock
        ? ""
        : "none";
  });
}




export function getUniqueAulas(data) {
  return Array.from(new Set(data.map(d => d.place)));
}

export function getUniqueTimes(data) {
  return Array.from(new Set(data.map(d => d.time)));
}

export function slug(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}


function renderTable() {
  renderHead();
  renderBody();
}

function renderHead() {
  const thead = document.getElementById("thead");
  thead.innerHTML = "";

  const tr = document.createElement("tr");
  tr.innerHTML = `<th class="">Hora</th>`;

  aulas.forEach(aula => {
    const th = document.createElement("th");
    th.textContent = aula;
    th.classList.add(slug(aula));
    tr.appendChild(th);
  });

  thead.appendChild(tr);
}

function renderBody() {
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = "";

  times.forEach(time => {
    const tr = document.createElement("tr");
    tr.classList.add(`time`);

    tr.innerHTML = `<th class="sticky">${time}</th>`;

    aulas.forEach(aula => {
      const td = document.createElement("td");
      td.classList.add(slug(aula));

    const competitionsInCell = normalizedSchedules.filter(
      c => c.time === time && c.place === aula
    );

    competitionsInCell.forEach(c => {
      const div = document.createElement("div");
      div.className = "bloque";
      div.innerHTML = `<strong>${c.name}</strong><br>${c.event}`;
      div.dataset.game = c.name;
      td.appendChild(div);
    });
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}


function showAllGamesInSchedule() {
  selectedGames.clear();

  document.querySelectorAll(".game").forEach(btn => {
    selectedGames.add(btn.dataset.name);
    btn.classList.add("selected");
  });

  applyScheduleFilter();
}

function hideAllGamesInSchedule() {
  selectedGames.clear();

  document.querySelectorAll(".game").forEach(btn => {
    btn.classList.remove("selected");
  });

  applyScheduleFilter();
}


document
  .getElementById("showAllGames")
  .addEventListener("click", showAllGamesInSchedule);

document
  .getElementById("hideAllGames")
  .addEventListener("click", hideAllGamesInSchedule);