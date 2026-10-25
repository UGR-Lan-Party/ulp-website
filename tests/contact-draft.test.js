import test from 'node:test';
import assert from 'node:assert/strict';
import { contactDraft } from '../src/utils/contact-draft.js';
test('Mail draft fixes the recipient and encodes accented names, plus signs and message newlines as data', () => {
  const draft = contactDraft({
    name: 'María & Álvaro',
    email: 'maria+ulp@example.org',
    subject: 'Colaboración & conciertos',
    message: 'Hola, ULP.\n¿Hablamos? & cc=otro@example.org',
  });
  const url = new URL(draft.url);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'ulp@ugr.es');
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
  assert.equal(
    url.searchParams.get('subject'),
    'Contacto ULP · Colaboración & conciertos',
  );
  assert(url.searchParams.get('body').includes('maria+ulp@example.org'));
  assert(
    url.searchParams
      .get('body')
      .includes('Hola, ULP.\n¿Hablamos? & cc=otro@example.org'),
  );
  assert(draft.text.startsWith('Para: ulp@ugr.es'));
});
test('Draft strips header line breaks and bounds fields without adding mail recipients', () => {
  const draft = contactDraft({
    subject: 'Test\r\nBcc: otro@example.org',
    name: 'N\nM',
    message: 'a'.repeat(3000),
  });
  const url = new URL(draft.url);
  assert(!url.searchParams.get('subject').includes('\n'));
  assert(!url.searchParams.has('bcc'));
  assert(url.searchParams.get('body').endsWith('a'.repeat(2000)));
});
