// ======= Sticky
document.addEventListener('DOMContentLoaded', function () {
  window.onscroll = function () {
    const ud_header = document.querySelector('.ud-header');
    const sticky = ud_header.offsetTop;
    const logo = document.querySelectorAll('.header-logo');
    const imgModoOscuro = document.getElementById('img-modo-oscuro');
    const imgModoClaro = document.getElementById('img-modo-claro');

    if (window.pageYOffset > sticky) {
      ud_header.classList.add('sticky-header');
      ud_header.classList.remove('absolute', 'bg-transparent', 'z-40');
      imgModoOscuro.classList.add('dark:block', 'hidden');
      imgModoClaro.classList.add('block', 'dark:hidden');
      imgModoClaro.classList.remove('hidden');

    } else {
      ud_header.classList.remove('sticky-header');
      ud_header.classList.add('absolute', 'bg-transparent', 'z-40');
      imgModoOscuro.classList.remove('dark:block', 'hidden');
      imgModoClaro.classList.remove('block', 'dark:hidden');
      imgModoClaro.classList.add('hidden');
    }

    // show or hide the back-top-top button
    const backToTop = document.querySelector('.back-to-top');
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      backToTop.style.display = 'flex';
    } else {
      backToTop.style.display = 'none';
    }
  };
});
