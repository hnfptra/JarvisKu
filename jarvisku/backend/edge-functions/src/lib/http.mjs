import { ZodError } from 'zod';

/**
 * Shared HTTP response helpers. Return shape is platform-agnostic:
 *   { status, headers, body }
 * The Netlify/Vercel adapters serialize it to their native handler format.
 */

const HEADERS = {
  'content-type': 'application/json',
  'access-control-allow-origin': process.env.CORS_ORIGIN || '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
};

export function ok(data, status = 200) {
  return { status, headers: HEADERS, body: JSON.stringify({ ok: true, data }) };
}

export function fail(message, status = 400, code = 'BAD_REQUEST') {
  return {
    status,
    headers: HEADERS,
    body: JSON.stringify({ ok: false, error: { code, message } }),
  };
}

export function parseError(e) {
  if (e instanceof ZodError) {
    const message = e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return fail(message, 400, 'VALIDATION_ERROR');
  }
  if (e?.message?.includes('not set') || e?.message?.includes('MONGODB_URI')) {
    return fail('Service configuration error', 500, 'CONFIG_ERROR');
  }
  if (e?.status) return fail(e.message, e.status, e.code || 'ERROR');
  console.error('[unhandled]', e);
  return fail('Internal error', 500, 'INTERNAL');
}

export function parseJson(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { __malformed: true };
  }
}

/** Very small in-memory rate limiter. Fine for a solo MVP; swap for Upstash Redis at scale. */
const buckets = new Map();
export function rateLimit(key, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  bucket.count += 1;
  if (bucket.count > limit) return { allowed: false, retryAfter: bucket.resetAt - now };
  return { allowed: true };
}

export function idToStr(id) {
  if (!id) return id;
  return id.toString?.() ?? id;
}
