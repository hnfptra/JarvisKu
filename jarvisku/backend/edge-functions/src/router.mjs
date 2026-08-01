import { parseError } from './lib/http.mjs';

/**
 * Tiny REST router with zero dependencies.
 * Handlers: { method: 'GET'|'POST'|..., path: '/foo/:id', run(ctx) => httpResult }
 * ctx = { params, query, body, headers, userId (string|undefined) }
 * Returns a { status, headers, body } object.
 */
export class Router {
  routes = [];

  add(method, path, handler) {
    const keys = [];
    const regexStr = path
      .split('/')
      .map((seg) => {
        if (seg === '*') return '.*';
        if (seg.startsWith(':')) {
          keys.push(seg.slice(1));
          return '([^/]+)';
        }
        return seg;
      })
      .join('/');
    this.routes.push({
      method,
      regex: new RegExp(`^${regexStr}$`),
      keys,
      handler,
    });
  }

  get(path, h) {
    this.add('GET', path, h);
  }
  post(path, h) {
    this.add('POST', path, h);
  }
  put(path, h) {
    this.add('PUT', path, h);
  }
  delete(path, h) {
    this.add('DELETE', path, h);
  }

  /** Returns a Promise<{ status, headers, body }> or 404. */
  async handle(method, pathname, ctx) {
    const url = new URL(pathname, 'http://localhost');
    const path = url.pathname;
    for (const r of this.routes) {
      if (r.method !== method) continue;
      const m = path.match(r.regex);
      if (!m) continue;
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      const query = Object.fromEntries(url.searchParams);
      try {
        return await r.handler({ ...ctx, params, query });
      } catch (e) {
        if (e?.status) {
          return { status: e.status, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: { code: e.code || 'ERROR', message: e.message } }) };
        }
        return parseError(e);
      }
    }
    return { status: 404, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: { code: 'NOT_FOUND', message: `No route ${method} ${path}` } }) };
  }
}
