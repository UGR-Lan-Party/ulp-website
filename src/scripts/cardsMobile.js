/*
  Se ha creado este script para que la animación hover de las cartas de competiciones
  sea visible en dispositivos táctiles.
  El comportamiento anterior, al pulsar la carta, navegaba instantáneamente a la página.
  Ahora, al pulsar la carta, se activa la animación y, tras un segundo, navega a la página.
*/

document.querySelectorAll('.competition-card').forEach((card) => {
  // Clase animate creada para activar las animaciones
  function activeAnimation() {
    card.classList.add('animate');
  }

  // Función para navegar a la página de la competición
  function navigateToPage() {
    window.location.href = card.href;
  }

  // Evento touchstart para dispositivos táctiles
  card.addEventListener('touchstart', (event) => {
    event.preventDefault();
    activeAnimation();
    setTimeout(navigateToPage, 1000); 
  });

});