/**
 * Local dev server for edge functions.
 * Run: npm run dev  (node --watch src/server.mjs)
 * Mirrors the Netlify/Vercel adapters over plain http. Stateless.
 */
import 'dotenv/config';
import http from 'node:http';
import { buildRouter } from './app.mjs';
import { parseJson } from './lib/http.mjs';

const PORT = process.env.PORT || 8888;
const router = buildRouter();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const raw = await readBody(req);
  const ctx = {
    body: parseJson(raw),
    headers: req.headers,
    query: Object.fromEntries(url.searchParams),
  };
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const result = await router.handle(req.method, path, ctx);
  res.writeHead(result.status, result.headers);
  res.end(result.body);
});

function readBody(req) {
  return new Promise((resolve) => {
    let acc = '';
    req.on('data', (c) => (acc += c));
    req.on('end', () => resolve(acc));
  });
}

server.listen(PORT, () => console.log(`[jarvisku] edge dev server on http://localhost:${PORT}`));
