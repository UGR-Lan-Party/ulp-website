import { schedules } from '../data/schedules';
import '../components/ActividadesSection.astro';

document.addEventListener('DOMContentLoaded', () => {
  const allTags = document.querySelectorAll('.tag');
  let showFiltersDropDown = false;
  let selectedTags = [];

  const buttonFilter = document.getElementById('filterButton');
  const iconFilter = document.getElementById('filterIcon');

  const filterDropDown = document.getElementById('filterDropdown');
  const activeFilters = document.getElementById('activeFilters');

  const gameButtons = document.querySelectorAll('.game');
  const gameInfo = document.getElementById('gameInfo');

  const isDarkMode = document.documentElement.classList.contains('dark');
  iconFilter.style.color = showFiltersDropDown
    ? '#D1A000'
    : isDarkMode
      ? 'white'
      : 'black';

  function updateIconColor() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    iconFilter.style.color = showFiltersDropDown
      ? '#D1A000'
      : isDarkMode
        ? 'white'
        : 'black';
  }

  // Observador de cambios en la clase del <html>
  const observer = new MutationObserver(() => updateIconColor());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  // También actualizar cuando `showFiltersDropDown` cambie (esto depende de cómo lo manejas en tu código)
  document.addEventListener('DOMContentLoaded', updateIconColor);

  // Manejo de cambios en los filtros
  function handleTagToggle(event) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const tag = event.target.textContent; // Obtener el texto del botón
    showFiltersDropDown = false;
    iconFilter.style.color = showFiltersDropDown
      ? '#D1A000'
      : isDarkMode
        ? 'white'
        : 'black';
    filterDropDown.style.visibility = showFiltersDropDown
      ? 'visible'
      : 'hidden';

    if (selectedTags.includes(tag)) {
      // Si ya está seleccionada, la eliminamos
      selectedTags = selectedTags.filter((t) => t !== tag);
    } else {
      // Si no está seleccionada, la agregamos al array
      selectedTags = [...selectedTags, tag];
    }

    console.log(selectedTags);

    updateSelectedTagsUI();
  }

  function updateSelectedTagsUI() {
    // Limpiar el contenedor antes de agregar los nuevos botones
    activeFilters.innerHTML = '';

    // Crear un botón para cada etiqueta seleccionada
    selectedTags.forEach((tag) => {
      const button = document.createElement('button');
      button.textContent = tag; // El texto del botón es la etiqueta
      button.classList.add('active-filter');

      // Puedes agregar una acción al botón si lo deseas
      button.addEventListener('click', () => {
        // Eliminar la etiqueta de 'selectedTags'
        selectedTags = selectedTags.filter((t) => t !== tag);

        // Actualizar la interfaz
        updateSelectedTagsUI();
      });

      const cross = document.createElement('i');
      cross.classList.add('cross');
      cross.className = 'fas fa-times';

      // Agregar el botón al contenedor
      activeFilters.appendChild(button);
      button.appendChild(cross);
    });

    filterGames();
  }

  function filterGames() {
    const searchQuery = searchInput.value.toLowerCase();

    gameButtons.forEach((game) => {
      const gameName = game.dataset.name.toLowerCase();
      const gameTags = game.dataset.tags.trim().toLowerCase().split(',');

      // Verificar si el nombre del juego coincide con la búsqueda
      const matchesSearch = gameName.includes(searchQuery);
      // Verificar si el juego tiene la etiqueta seleccionada (o ninguna si no se seleccionó ninguna etiqueta)
      const matchesTag =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => gameTags.includes(tag.toLowerCase()));

      // Mostrar el botón solo si coincide con ambos filtros
      if (matchesSearch && matchesTag) {
        game.style.display = 'flex';
      } else {
        game.style.display = 'none';
      }
    });
  }

  // Función para mostrar la información del juego seleccionado
  function showGameInfo(game) {
    gameInfo.innerHTML = ''; // Limpiar la información previa

    if (game) {
      game.eventos.forEach((evento) => {
        const timeSlot = document.createElement('div');
        timeSlot.classList.add('time-slot');

        const time = document.createElement('span');
        time.textContent = evento.time;
        time.classList.add('time');

        timeSlot.appendChild(time);

        const eventName = document.createElement('span');
        eventName.textContent = evento.event;
        eventName.classList.add('event');

        timeSlot.appendChild(eventName);

        gameInfo.appendChild(timeSlot);
      });
    }
  }

  // Añadir event listener al campo de búsqueda
  searchInput.addEventListener('input', filterGames);

  buttonFilter.addEventListener('click', () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    showFiltersDropDown = !showFiltersDropDown;
    iconFilter.style.color = showFiltersDropDown
      ? '#D1A000'
      : isDarkMode
        ? 'white'
        : 'black';

    filterDropDown.style.visibility = showFiltersDropDown
      ? 'visible'
      : 'hidden';
  });

  // Añadir un event listener a cada tag
  allTags.forEach((tag) => {
    tag.addEventListener('click', handleTagToggle);
  });

  function handleGameClick(event) {
    const selectedButton = event.currentTarget;

    // Remover la clase "selected" de todos los juegos
    document
      .querySelectorAll('.game')
      .forEach((btn) => btn.classList.remove('selected'));

    // Agregar la clase "selected" al botón clickeado
    selectedButton.classList.add('selected');
    showGameInfo(
      schedules.find((game) => game.name === selectedButton.dataset.name),
    );
  }

  // Asignar el evento "click" a cada juego en el HTML
  document.querySelectorAll('.game').forEach((button) => {
    button.addEventListener('click', handleGameClick);
  });

  document.querySelector('.game').click();

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

        .fas.fa-times {
            margin-left: 5px;
            
        }

        .time-slot {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            color: black;
        }

        .time {
            font-family: 'Fragment Mono', sans-serif;
            font-size: 1rem;
            padding: 0.5rem;
            padding-right: 1rem;
            border-right: 1px solid rgba(255, 255, 255, 0.5);
            border-color: black;

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

            .time {
                font-size: clamp(0.9rem, 4vw, 1rem); /* Reducir aún más en pantallas muy pequeñas */
            }

            .event {
                font-size: clamp(0.9rem, 4vw, 1rem); /* Reducir aún más en pantallas muy pequeñas */
                margin-top: 0.2rem;
            }

        }

        @media (max-width: 500px) {
            .time {
                font-size: clamp(0.8rem, 2vw, 1rem); /* Reducir aún más en pantallas muy pequeñas */
            }

            .event {
                font-size: clamp(0.8rem, 2vw, 1rem); /* Reducir aún más en pantallas muy pequeñas */
                margin-top: 0.3rem;
            }
        }
    `;

  document.head.appendChild(style);
});
