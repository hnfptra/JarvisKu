import { buildRouter } from '../../src/app.mjs';
import { parseJson, parseError } from '../../src/lib/http.mjs';

const router = buildRouter();

/**
 * Vercel Edge Function entry point (optional alternative to Netlify).
 * Deployment: vercel --prod (project root configured with edge-functions/vercel dir).
 */
export const config = { runtime: 'edge', regions: ['fra1'] };

export default async function handler(request) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  const raw = await request.text();
  const ctx = {
    body: parseJson(raw),
    headers: Object.fromEntries(request.headers),
    query: Object.fromEntries(url.searchParams),
  };
  let result;
  try {
    const path = url.pathname.replace(/^\/api/, '') || '/';
    result = router.handle(request.method, path, ctx);
  } catch (e) {
    result = parseError(e);
  }
  return new Response(result.body, {
    status: result.status,
    headers: { ...corsHeaders(request), ...result.headers },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get('origin') || '*';
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-credentials': 'true',
    'content-type': 'application/json',
  };
}
