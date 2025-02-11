/*
  Se ha creado este script para que la animación hover de las cartas de competiciones
  sea visible en dispositivos táctiles.
  El comportamiento anterior, al pulsar la carta, navegaba instantáneamente a la página.
  Ahora, al pulsar la carta, se activa la animación y, tras un segundo, navega a la página.
*/

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.competition-card');
  let isScrolling = false;
  let startX = 0;
  let startY = 0;

  cards.forEach((card) => {
    // Detectar inicio del toque
    card.addEventListener('touchstart', (event) => {
      isScrolling = false;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    });

    // Detectar movimiento del toque
    card.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      const deltaX = Math.abs(touch.clientX - startX);
      const deltaY = Math.abs(touch.clientY - startY);

      // Si hay un desplazamiento significativo en X o Y, se considera scroll
      if (deltaX > 10 || deltaY > 10) {
        isScrolling = true;
      }
    });

    // Detectar final del toque
    card.addEventListener('touchend', (event) => {
      if (isScrolling) {
        //Desplazamiento detectado, no se ejecuta click
        return;
      
      }else{
        //Toque válido, ejecuta lógica de click
        
        event.preventDefault(); // Cancelamos navegación a la página de competición
        card.classList.add('animate');

        // Hacemos que la navegación se ejecute tras 1s, tiempo suficiente para ver la animación
        setTimeout(() => {
          window.location.href = card.href;
        }, 1000);
      }
    });
  });
});