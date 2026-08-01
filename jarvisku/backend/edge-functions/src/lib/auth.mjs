import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { env } from '../config/env.mjs';
import { fail } from './http.mjs';

export const REFRESH_COOKIE = 'jk_refresh';

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId.toString(), type: 'access' }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId.toString(), type: 'refresh', jti: crypto.randomUUID() }, env.JWT_SECRET, {
    expiresIn: env.REFRESH_EXPIRES_IN,
  });
}

/** Throws a { status, message, code } object on failure. */
export function verifyAccessToken(token) {
  if (!token) {
    const e = new Error('Missing token');
    e.status = 401;
    throw e;
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (payload.type !== 'access') throw new Error('wrong type');
    return payload.sub;
  } catch {
    const e = new Error('Invalid or expired token');
    e.status = 401;
    throw e;
  }
}

export function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (payload.type !== 'refresh') throw new Error('wrong type');
    return payload.sub;
  } catch {
    const e = new Error('Invalid or expired refresh token');
    e.status = 401;
    throw e;
  }
}

/** Express-style middleware that returns a { status, headers, body } response or null. */
export function requireAuth(request) {
  const token = request.headers?.authorization?.replace(/^Bearer\s+/i, '') || '';
  try {
    const userId = verifyAccessToken(token);
    return { userId, userIdObj: new ObjectId(userId) };
  } catch (e) {
    return fail(e.message || 'Unauthorized', e.status || 401, 'UNAUTHORIZED');
  }
}

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
