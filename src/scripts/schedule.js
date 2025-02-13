import {schedules} from "../components/ActividadesSection.astro"
import "../components/ActividadesSection.astro"

document.addEventListener("DOMContentLoaded", () => {

    const allTags = document.querySelectorAll(".tag");
    let showFiltersDropDown = false;
    let selectedTags = [];

    const buttonFilter = document.getElementById("filterButton");
    const iconFilter = document.getElementById("filterIcon");

    const filterDropDown = document.getElementById("filterDropdown");
    const activeFilters = document.getElementById("activeFilters");

    const gamesList = document.getElementById("gameList");
    const gameInfo = document.getElementById("gameInfo");

    let gameButtons = {}; // Guardará los botones creados
    function changeColor() {
        setTimeout(() => {
            const games = document.querySelectorAll(".game");

            games.forEach(game => {
                
                // Estilos básicos
                game.style.backgroundColor = "rgba(42, 112, 146, 0.6)";
                game.style.color = "white";
                game.style.padding = "15px 20px";
                game.style.borderRadius = "10px";
                game.style.fontSize = "1.2rem";
                game.style.cursor = "pointer";
                game.style.textAlign = "left";
                game.style.width = "100%";
                game.style.justifyContent = "space-between";
                game.style.alignItems = "center";
                game.style.fontWeight = "bold";
                game.style.transition = "all 0.3s ease-in-out";
                game.style.userSelect = "none";// Asegura que el padding no cambie el tamaño
                game.style.height = "50px"; // La altura se ajusta al contenido
            });

            const selectedGame = document.querySelector(".game.selected");


            if (selectedGame) {
                selectedGame.style.backgroundColor = "white";
                selectedGame.style.color = "#011627";
            }
        });
    }

    function createGameButtons() {
        schedules.forEach(game => {
            const button = document.createElement("button");
            button.classList.add("game");
            button.textContent = game.name;
            button.dataset.name = game.name.trim();
            
            button.style.display = "flex";

            const span = document.createElement("span");
            span.textContent = game.aula;
            span.classList.add("location");
            span.style.paddingLeft = "20px";
            span.style.fontSize = "1rem";
            span.style.opacity = "0.8";

            button.appendChild(span);
            gamesList.appendChild(button);

            // Almacenar el botón en el objeto con su ID
            gameButtons[game.name] = button;

            // Evento de selección
            button.addEventListener("click", () => {
                document.querySelectorAll(".game").forEach(btn => btn.classList.remove("selected"));
                button.classList.add("selected");
                showGameInfo(game);
                changeColor();
            });
        });
    }


    // Manejo de cambios en los filtros
    function handleTagToggle(event) {
        const tag = event.target.textContent;  // Obtener el texto del botón
        showFiltersDropDown = false;
        iconFilter.style.color = showFiltersDropDown ? "#D1A000" : "white";
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

            button.style.backgroundColor = "rgba(42, 112, 146, 0.6)";
            button.style.color = "white";
            button.style.padding = "10px";
            button.style.borderRadius = "5px";
            button.style.textAlign = "center";
            button.style.cursor = "pointer";

            // Puedes agregar una acción al botón si lo deseas
            button.addEventListener("click", () => {
                // Eliminar la etiqueta de 'selectedTags'
                selectedTags = selectedTags.filter(t => t !== tag);
                
                // Actualizar la interfaz
                updateSelectedTagsUI();
                console.log(`${tag} filtro eliminado`);
            });

            const cross = document.createElement("i");
            cross.className = "fas fa-times";
            cross.style.marginLeft = "5px";
    
            // Agregar el botón al contenedor
            activeFilters.appendChild(button);
            button.appendChild(cross);
        });

        filterGames();
    }

    function filterGames(){
        const searchQuery = searchInput.value.toLowerCase();

        schedules.forEach(game => {
            const gameKey = game.name.trim(); // Asegurar coincidencia exacta
            const button = gameButtons[gameKey];

            if (!button) {
                console.warn(`⚠ No se encontró botón para: ${game.name}`);
                return;
            }

            const matchesSearch = game.name.toLowerCase().includes(searchQuery);
            const matchesTags = selectedTags.length === 0 || selectedTags.some(tag =>
                game.tags.some(gameTag => gameTag.trim() === tag.trim())
            );

            // Mostrar u ocultar el botón sin afectar el tamaño
            button.style.display = (matchesSearch && matchesTags) ? "flex" : "none";
        });
    }


    // Función para mostrar la información del juego seleccionado
    function showGameInfo(game) {
        gameInfo.innerHTML = ""; // Limpiar la información previa

        if (game) {
            game.eventos.forEach((evento) => {
                const timeSlot = document.createElement("div");
                timeSlot.classList.add("time-slot");

                timeSlot.style.display = "flex";
                timeSlot.style.justifyContent = "space-between";

                const time = document.createElement("span");
                time.textContent = evento.time;
                time.classList.add("time");

                time.style.fontFamily = "Fragment Mono', sans-serif";
                time.style.fontSize = "1rem";
                time.style.padding = "0.5rem";
                time.style.paddingRight = "1rem";
                time.style.borderRight = "1px solid rgba(255, 255, 255, 0.5)";

                timeSlot.appendChild(time);

                const eventName = document.createElement("span");
                eventName.textContent = evento.event;
                eventName.classList.add("event");

                eventName.style.fontFamily = "'Inter', sans-serif";
                eventName.style.fontSize = "1.5rem";
                eventName.style.fontWeight = "bold";
                eventName.style.textAlign = "right";
                eventName.style.paddingLeft = "1rem";


                timeSlot.appendChild(eventName);

                gameInfo.appendChild(timeSlot);
            });
        }
    }

    // Añadir event listener al campo de búsqueda
    searchInput.addEventListener("input", filterGames);



    buttonFilter.addEventListener("click", () => {
        showFiltersDropDown = !showFiltersDropDown;
        iconFilter.style.color = showFiltersDropDown ? "#D1A000" : "white";

        filterDropDown.style.visibility = showFiltersDropDown ? "visible" : "hidden";
    });

    // Añadir un event listener a cada tag
    allTags.forEach(tag => {
        tag.addEventListener("click", handleTagToggle);
    })


    createGameButtons();

    gamesList.children[0].click();
    
    changeColor();

});