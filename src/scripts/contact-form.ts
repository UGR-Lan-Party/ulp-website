import { contactDraft } from '../utils/contact-draft.js';
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) {
  const status = form.querySelector<HTMLElement>('[data-contact-status]')!;
  const draft = form.querySelector<HTMLAnchorElement>('[data-contact-draft]')!;
  const fallback = form.querySelector<HTMLElement>('[data-contact-fallback]')!;
  const copyText = fallback.querySelector<HTMLTextAreaElement>('textarea')!;
  form
    .querySelectorAll<HTMLButtonElement>('button')
    .forEach((button) => (button.disabled = false));
  function compose() {
    const data = new FormData(form!);
    return contactDraft(Object.fromEntries(data));
  }
  form.addEventListener('input', () => {
    draft.hidden = true;
    fallback.hidden = true;
    status.textContent = '';
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    draft.href = compose().url;
    draft.hidden = false;
    status.textContent =
      'Se abrirá tu aplicación de correo. Revisa el borrador y pulsa enviar allí. Si no se abre, puedes copiar el mensaje.';
    draft.click();
  });
  form
    .querySelector('[data-contact-copy]')!
    .addEventListener('click', async () => {
      if (!form.reportValidity()) return;
      const text = compose().text;
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        status.textContent =
          'Mensaje copiado. Pégalo en un correo a ulp@ugr.es.';
      } catch {
        fallback.hidden = false;
        copyText.value = text;
        copyText.focus();
        copyText.select();
        status.textContent =
          'Copia el texto seleccionado y pégalo en tu aplicación de correo.';
      }
    });
}
