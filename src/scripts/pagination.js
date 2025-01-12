import { faqs } from "../components/Faq.astro";                     

const classNameFaQ = '-faq'
const QPerPages = 4;
const tam = faqs.length;
const numberOfPages = Math.ceil(tam / QPerPages);
let currentButton = null;


const getQAS = (page, QPerPages,questions) => {
    let start = (page - 1) * QPerPages;
    let end = page * QPerPages;
    return questions.slice(start, end);
}

let previousDoubts = getQAS(1, QPerPages, faqs);

document.addEventListener('DOMContentLoaded', () => {
    const pagination = document.getElementById('pagination');
    
    //Load QAs of the firts page
    for(let i = 0; i < QPerPages; i++){
        const el = document.getElementById(`${i}${classNameFaQ}`);
        if(el !== null){
            el.classList.remove('hidden');
            el.classList.add('flex');
        }
    }

    //Create pagination buttons
    for(let i = 0; i < numberOfPages; i++){
        const pageButton = document.createElement('button');
        pageButton.textContent = i + 1;
        pageButton.className = 'rounded-full duration-300 bg-primary text-white hover:bg-secondary min-w-[50px] min-h-[50px] min-h-4 text-xl lg:text-3xl transition-all ease-in-out shadow-black dark:shadow-white'
        
        if(i === 0){
            pageButton.classList.remove('bg-primary');
            pageButton.classList.add('bg-secondary', 'shadow-md');
            currentButton = pageButton;
        }

        pageButton.addEventListener('click', () => {
            if(previousDoubts.length != 0){
                previousDoubts.map((prev) => {
                    const el = document.getElementById(`${prev.id}${classNameFaQ}`);
                    el.classList.remove('flex');
                    el.classList.add('hidden');
                }) 
            }

            currentButton.classList.remove('bg-secondary', 'shadow-md');
            currentButton.classList.add('bg-primary');

            pageButton.classList.remove('bg-primary');
            pageButton.classList.add('bg-secondary', 'shadow-md');
            currentButton = pageButton;
            
            const doubts = getQAS(i + 1, QPerPages, faqs);
            doubts.map((doubt) => {
                const el = document.getElementById(`${doubt.id}${classNameFaQ}`);
                el.classList.remove('hidden');
                el.classList.add('flex');
            })
            previousDoubts = doubts;
        });

        pagination.appendChild(pageButton);
    }
})