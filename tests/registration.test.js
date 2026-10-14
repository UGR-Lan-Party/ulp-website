import test from 'node:test';
import assert from 'node:assert/strict';
import { getRegistrationState } from '../src/utils/registration.js';

const activity = {
  registration: 'https://forms.gle/example',
  registrationPeriodOpen: true,
};
const edition = { year: 2027, phase: 'registration-open' };

test('Las actividades sin formulario no requieren inscripción', () => {
  assert.deepEqual(getRegistrationState({ registration: '' }, 2027, edition), {
    label: 'N/A',
    href: null,
  });
});

test('El enlace de inscripción solo se habilita para una actividad abierta de la edición actual', () => {
  assert.deepEqual(getRegistrationState(activity, 2027, edition), {
    label: 'Inscribirme',
    href: activity.registration,
  });
  for (const phase of ['announced', 'live', 'finished']) {
    assert.deepEqual(
      getRegistrationState(activity, 2027, { ...edition, phase }),
      { label: 'Cerrada', href: null },
    );
  }
  assert.equal(getRegistrationState(activity, 2026, edition).href, null);
  assert.equal(
    getRegistrationState(
      { ...activity, registrationPeriodOpen: false },
      2027,
      edition,
    ).href,
    null,
  );
});
