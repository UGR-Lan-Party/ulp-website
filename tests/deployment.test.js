import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { checkDeployment } from '../scripts/check-deployment.mjs';

test('La comprobación de despliegue detecta una versión equivocada', async () => {
  const server = createServer((request, response) => {
    if (request.url === '/version.json') {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ commit: 'test-version' }));
    } else response.end('<main>Contenido</main>');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    assert.deepEqual(await checkDeployment(url, 'test-version'), {
      commit: 'test-version',
    });
    await assert.rejects(
      checkDeployment(url, 'other-version'),
      /versión servida/,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
