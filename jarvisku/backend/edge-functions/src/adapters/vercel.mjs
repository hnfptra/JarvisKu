import { parseJson } from '../lib/http.mjs';

/**
 * Vercel Edge Functions adapter.
 * Native handler: export default async (req: Request) => Response.
 * Uses Web API — runs on any edge runtime, including Node on Vercel.
 */
export function toVercelHandler(run) {
  return async (request) => {
    const url = new URL(request.url);
    const method = request.method;
    const raw = await request.text();
    const ctx = {
      body: parseJson(raw),
      headers: Object.fromEntries(request.headers),
      query: Object.fromEntries(url.searchParams),
    };
    const res = run(method, url.pathname, ctx);
    return new Response(res.body, {
      status: res.status,
      headers: new Headers(res.headers),
    });
  };
}
