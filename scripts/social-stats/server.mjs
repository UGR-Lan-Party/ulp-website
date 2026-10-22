import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { createSocialStats } from './providers.mjs';

export function createSocialServer(options = {}) {
  const stats = createSocialStats(options);
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('{}');
      return;
    }
    if (request.url === '/health') {
      response.end(request.method === 'HEAD' ? undefined : '{"ok":true}');
      return;
    }
    if (request.url !== '/api/social-stats') {
      response.writeHead(404);
      response.end('{}');
      return;
    }
    try {
      const data = await stats.getSnapshot();
      response.end(
        request.method === 'HEAD' ? undefined : JSON.stringify(data),
      );
    } catch {
      response.writeHead(503);
      response.end('{"error":"Statistics unavailable"}');
    }
  });
  server.requestTimeout = 20_000;
  server.headersTimeout = 10_000;
  return server;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const port = Number(process.env.SOCIAL_STATS_PORT || 8788);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error('Invalid port');
  createSocialServer().listen(
    port,
    process.env.SOCIAL_STATS_HOST || '127.0.0.1',
    () => console.log(`Social statistics service ready on port ${port}`),
  );
}
