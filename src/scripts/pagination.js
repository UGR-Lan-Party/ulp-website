import { faqs } from '../data/faqs';

const classNameFaQ = '-faq';
const QPerPages = 4;
const tam = faqs.length;
const numberOfPages = Math.ceil(tam / QPerPages);
let currentButton = null;

const getQAS = (page, QPerPages, questions) => {
  let start = (page - 1) * QPerPages;
  let end = page * QPerPages;
  return questions.slice(start, end);
};

let previousDoubts = getQAS(1, QPerPages, faqs);

document.addEventListener('DOMContentLoaded', () => {
  const pagination = document.getElementById('pagination');

  previousDoubts.forEach((doubt) => {
    const el = document.getElementById(`${doubt.id}${classNameFaQ}`);
    if (el !== null) {
      el.classList.remove('hidden');
      el.classList.add('flex');
      typeTitleEffect(el.querySelector('summary'), doubt.title);
      el.querySelector('p').textContent = doubt.description;
    }
  });

  for (let i = 0; i < numberOfPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i + 1;
    pageButton.className =
      'rounded-full duration-300 bg-primary dark:bg-gray-400 text-white dark:text-primary hover:bg-secondary dark:hover:bg-gray-200 min-w-[40px] min-h-[40px] min-h-4 text-xl lg:text-2xl transition-all ease-in-out shadow-black';

    if (i === 0) {
      pageButton.classList.remove('bg-primary', 'dark:bg-gray-400');
      pageButton.classList.add('bg-secondary', 'dark:bg-gray-200', 'shadow-md');
      currentButton = pageButton;
    }

    pageButton.addEventListener('click', () => {
      if (previousDoubts.length !== 0) {
        previousDoubts.forEach((prev) => {
          const el = document.getElementById(`${prev.id}${classNameFaQ}`);
          el.classList.remove('flex');
          el.classList.add('hidden');
        });
      }

      // Cambiar estilos de botón activo
      currentButton.classList.remove(
        'bg-secondary',
        'dark:bg-gray-200',
        'shadow-md',
      );
      currentButton.classList.add('bg-primary', 'dark:bg-gray-400');

      pageButton.classList.remove('bg-primary', 'dark:bg-gray-400');
      pageButton.classList.add('bg-secondary', 'dark:bg-gray-200', 'shadow-md');
      currentButton = pageButton;

      const doubts = getQAS(i + 1, QPerPages, faqs);
      doubts.forEach((doubt) => {
        const el = document.getElementById(`${doubt.id}${classNameFaQ}`);
        el.classList.remove('hidden');
        el.classList.add('flex');

        typeTitleEffect(el.querySelector('summary'), doubt.title);

        el.querySelector('p').textContent = doubt.description;
      });
      previousDoubts = doubts;
    });

    pagination.appendChild(pageButton);
  }
});

function typeTitleEffect(element, newText) {
  let oldText = element.textContent;
  let maxLength = Math.max(oldText.length, newText.length);
  let index = 0;

  function replaceText() {
    if (index < maxLength) {
      let newPart = newText.substring(0, index + 1);
      let remainingPart =
        oldText.length > newText.length ? oldText.substring(index + 1) : '';

      element.textContent = newPart + remainingPart;
      index++;
      setTimeout(replaceText, 20);
    } else {
      element.textContent = newText;
    }
  }

  replaceText();
}
