const editionMedia = matchMedia('(max-width: 800px)');
const descriptions = document.querySelectorAll<HTMLDetailsElement>(
  '[data-edition-description]',
);
const syncEditionDescriptions = () =>
  descriptions.forEach((details) => {
    details.open = !editionMedia.matches;
  });
syncEditionDescriptions();
editionMedia.addEventListener('change', syncEditionDescriptions);
