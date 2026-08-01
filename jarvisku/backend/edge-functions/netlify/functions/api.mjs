import { buildRouter } from '../../src/app.mjs';
import { parseJson, parseError } from '../../src/lib/http.mjs';

const router = buildRouter();

/**
 * Netlify Functions entry point. All routes flow through one handler;
 * netlify.toml rewrites /api/* to this function so the router sees real paths.
 */
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(event), body: '' };
  }
  const result = await run(event);
  return {
    statusCode: result.status,
    headers: { ...corsHeaders(event), ...result.headers },
    body: result.body,
  };
};

async function run(event) {
  const ctx = {
    body: parseJson(event.body),
    headers: event.headers || {},
    query: event.queryStringParameters || {},
  };
  try {
    // Strip the /api/* rewrite prefix; the router works on the real path.
    const path = event.path.replace(/^\/api/, '') || '/';
    return router.handle(event.httpMethod, path, ctx);
  } catch (e) {
    return parseError(e);
  }
}

function corsHeaders(event) {
  const origin = event.headers?.origin || '*';
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-credentials': 'true',
    'access-control-max-age': '86400',
    'content-type': 'application/json',
  };
}
