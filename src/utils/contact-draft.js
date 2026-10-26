const oneLine = (value, max) =>
  Array.from(
    String(value ?? '')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
    .slice(0, max)
    .join('');
export function contactDraft(input = {}) {
  const name = oneLine(input.name, 80),
    email = oneLine(input.email, 254);
  const subject = 'Contacto ULP · ' + oneLine(input.subject, 100);
  const message = Array.from(String(input.message ?? '').trim())
    .slice(0, 2000)
    .join('');
  const body = `Nombre: ${name}\r\nCorreo: ${email}\r\n\r\n${message}`;
  return {
    url: `mailto:ulp@ugr.es?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    text: `Para: ulp@ugr.es\nAsunto: ${subject}\n\n${body}`,
  };
}
