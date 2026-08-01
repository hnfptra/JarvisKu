import { parseJson } from '../lib/http.mjs';

/**
 * Netlify Functions adapter.
 * Native handler: exports handler = async (event, context) => httpResponse.
 */
export function toNetlifyHandler(run) {
  return async (event) => {
    const method = event.httpMethod;
    // Preflight / path-based routing handled by netlify.toml redirects.
    const ctx = {
      body: parseJson(event.body),
      headers: event.headers || {},
      query: event.queryStringParameters || {},
    };
    return run(method, event.path, ctx);
  };
}
