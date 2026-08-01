import { Router } from './router.mjs';
import { fail, ok, rateLimit, parseError } from './lib/http.mjs';
import { requireAuth } from './lib/auth.mjs';
import { authRoutes } from './modules/auth.mjs';
import { assistantRoutes } from './modules/assistant.mjs';
import { autoreplyRoutes } from './modules/autoreply.mjs';
import { socialRoutes } from './modules/social.mjs';
import { premiumRoutes } from './modules/premium.mjs';
import { dashboardRoutes } from './modules/dashboard.mjs';

/** Attach CORS + rate-limit + auth guard per route group. */
export function buildRouter() {
  const router = new Router();

  router.get('/health', () => ok({ status: 'up', time: Date.now() }));

  const groups = [
    { prefix: '/', routes: authRoutes },
    { prefix: '/assistant', routes: assistantRoutes },
    { prefix: '/autoreply', routes: autoreplyRoutes },
    { prefix: '/social', routes: socialRoutes },
    { prefix: '/', routes: premiumRoutes },
    { prefix: '/dashboard', routes: dashboardRoutes },
  ];

  for (const { prefix, routes } of groups) {
    for (const r of routes) {
      const path = `${prefix}${r.path}`.replace(/\/+/g, '/');
      router.add(r.method, path, (ctx) => {
        if (!r.public) {
          const auth = requireAuth(ctx);
          if (auth.userId) ctx.userId = auth.userId;
          else return auth;
        }
        const rl = rateLimit(`rl:${r.public ? ctx.headers?.['x-forwarded-for'] : ctx.userId}`, r.limit || 60);
        if (!rl.allowed) return fail('Too many requests', 429, 'RATE_LIMITED');
        try {
          return r.run(ctx);
        } catch (e) {
          return parseError(e);
        }
      });
    }
  }

  // CORS preflight: browser sends OPTIONS before cross-origin POSTs.
  router.add('OPTIONS', '*', () => ({ status: 204, headers: HEADERS, body: '' }));

  return router;
}

const HEADERS = {
  'access-control-allow-origin': process.env.CORS_ORIGIN || '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
  'access-control-max-age': '86400',
};
