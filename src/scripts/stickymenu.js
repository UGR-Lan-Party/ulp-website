// ======= Sticky Header con detección de página y tema
document.addEventListener('DOMContentLoaded', function () {
  const ud_header = document.querySelector('.ud-header');
  const backToTop = document.querySelector('.back-to-top');
  const imgModoOscuro = document.getElementById('img-modo-oscuro');
  const imgModoClaro = document.getElementById('img-modo-claro');
  const isHomePage = window.location.pathname === '/';
  console.log('isHomePage', isHomePage);

  if (!ud_header || !imgModoOscuro || !imgModoClaro) return;

  window.onscroll = function () {
    if (window.scrollY > ud_header.offsetTop) {
      ud_header.classList.add('sticky-header');
      ud_header.classList.remove('absolute', 'bg-transparent', 'z-40');

      if (!isHomePage) {
        if (document.documentElement.classList.contains('dark')) {
          imgModoOscuro.classList.remove('hidden');
          imgModoClaro.classList.add('hidden');
        } else {
          imgModoOscuro.classList.add('hidden');
          imgModoClaro.classList.remove('hidden');
        }
      }
    } else {
      ud_header.classList.remove('sticky-header');
      ud_header.classList.add('absolute', 'bg-transparent', 'z-40');

      if (isHomePage) {
        imgModoOscuro.classList.add('hidden');
        imgModoClaro.classList.remove('hidden');
      } else {
        if (document.documentElement.classList.contains('dark')) {
          imgModoOscuro.classList.remove('hidden');
          imgModoClaro.classList.add('hidden');
        } else {
          imgModoOscuro.classList.add('hidden');
          imgModoClaro.classList.remove('hidden');
        }
      }
    }

    if (backToTop) {
      backToTop.style.display = window.scrollY > 50 ? 'flex' : 'none';
    }
  };
});
