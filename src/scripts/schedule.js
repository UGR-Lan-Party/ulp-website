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
        const filteredGames = schedules.filter(game => {
            // Filtrar por búsqueda
            const matchesSearch = game.name.toLowerCase().includes(searchQuery);

            // Filtrar por tags seleccionados
            const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => game.tags.some(gameTag => gameTag.trim() === tag.trim()));

            return matchesSearch && matchesTags;
        });

        displayFilteredGames(filteredGames);
    }

    // Función para mostrar los juegos filtrados
    function displayFilteredGames(filteredGames) {
        gamesList.innerHTML = ""; // Limpiar la lista de juegos

        filteredGames.forEach(game => {
            const button = document.createElement("button");
            button.classList.add("game");
            button.textContent = game.name;

            button.style.backgroundColor = "rgba(42, 112, 146, 0.6)";
            button.style.color = "white";
            button.style.padding = "15px 20px";
            button.style.borderRadius = "10px";
            button.style.fontSize = "1.2rem";
            button.style.cursor = "pointer";
            button.style.textAlign = "left";
            button.style.widht = "100%";
            button.style.display = "flex";
            button.style.justifyContent = "space-between";
            button.style.alignItems = "center";
            button.style.fontWeight = "bold";
            button.style.transition = "all 0.3s ease-in-out";
            button.style.userSelect = "none";


            const span = document.createElement("span");
            span.textContent = game.aula;
            span.classList.add("location");
            span.style.paddingLeft = "20px";
            span.style.fontFamily = "Fragment Mono', sans-serif";
            span.style.fontSize = "1rem";
            span.style.fontWeight = "normal";
            span.style.opacity = "0.8";
            span.style.marginTop = "4px";


            button.appendChild(span);
            gamesList.appendChild(button);

            // Añadir el comportamiento de selección al hacer clic
            button.addEventListener("click", () => {
                
                // Desmarcar todos los botones
                document.querySelectorAll(".game").forEach(btn => btn.classList.remove("selected"));
                // Marcar el botón actual como seleccionado
                button.classList.add("selected");

                button.style.backgroundColor = "white";
                button.style.color = "#011627";
                // Mostrar la información del juego seleccionado
                showGameInfo(game);
            });


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



    

    filterGames();

    gamesList.children[0].click();
    

});