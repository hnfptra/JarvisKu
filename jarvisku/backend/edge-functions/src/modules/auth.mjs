import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.mjs';
import { ok, fail, idToStr } from '../lib/http.mjs';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE,
} from '../lib/auth.mjs';

const registerSchema = z.object({
  name: z.string().min(1).max(60),
  email: z.string().email(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function publicUser(u) {
  return { _id: idToStr(u._id), name: u.name, email: u.email, createdAt: u.createdAt };
}

async function session(db, user) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  await db.collection('preferences').updateOne(
    { userId: user._id },
    { $set: { refreshToken, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
  return ok({ accessToken, refreshToken, user: publicUser(user) });
}

async function findByEmail(db, email) {
  return db.collection('users').findOne({ email: email.toLowerCase() });
}

export const authRoutes = [
  {
    method: 'POST',
    path: '/register',
    public: true,
    limit: 5,
    run: async (ctx) => {
      const data = registerSchema.parse(ctx.body);
      const db = await getDb();
      const email = data.email.toLowerCase();
      if (await findByEmail(db, email)) return fail('Email sudah terdaftar', 409, 'EMAIL_EXISTS');
      const user = {
        name: data.name.trim(),
        email,
        passwordHash: await hashPassword(data.password),
        plan: 'free',
        createdAt: new Date().toISOString(),
      };
      const { insertedId } = await db.collection('users').insertOne(user);
      const created = { ...user, _id: insertedId };
      await db.collection('preferences').insertOne({
        userId: insertedId,
        voiceEnabled: true,
        notificationsEnabled: true,
        theme: 'dark',
        refreshToken: null,
        createdAt: new Date().toISOString(),
      });
      return session(db, created);
    },
  },
  {
    method: 'POST',
    path: '/login',
    public: true,
    limit: 10,
    run: async (ctx) => {
      const data = loginSchema.parse(ctx.body);
      const db = await getDb();
      const user = await findByEmail(db, data.email);
      if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
        return fail('Email atau password salah', 401, 'INVALID_CREDENTIALS');
      }
      return session(db, user);
    },
  },
  {
    method: 'POST',
    path: '/refresh',
    public: true,
    run: async (ctx) => {
      const { refreshToken } = refreshSchema.parse(ctx.body);
      const userId = verifyRefreshToken(refreshToken);
      const db = await getDb();
      const pref = await db.collection('preferences').findOne({ userId: new ObjectId(userId) });
      if (!pref || pref.refreshToken !== refreshToken) {
        return fail('Refresh token tidak valid', 401, 'INVALID_REFRESH');
      }
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (!user) return fail('User tidak ditemukan', 404, 'USER_NOT_FOUND');
      // Rotate refresh token (reuse detection baseline).
      await db.collection('preferences').updateOne(
        { userId: user._id },
        { $set: { refreshToken: signRefreshToken(user._id), updatedAt: new Date().toISOString() } }
      );
      return session(db, user);
    },
  },
  {
    method: 'POST',
    path: '/logout',
    run: async (ctx) => {
      const db = await getDb();
      await db.collection('preferences').updateOne(
        { userId: new ObjectId(ctx.userId) },
        { $set: { refreshToken: null } }
      );
      return ok({ revoked: true });
    },
  },
  {
    method: 'GET',
    path: '/profile',
    run: async (ctx) => {
      const db = await getDb();
      const user = await db.collection('users').findOne({ _id: new ObjectId(ctx.userId) });
      if (!user) return fail('User tidak ditemukan', 404, 'USER_NOT_FOUND');
      const prefs = await db.collection('preferences').findOne({ userId: user._id });
      return ok({ user: publicUser(user), preferences: pickPrefs(prefs) });
    },
  },
  {
    method: 'PUT',
    path: '/profile',
    run: async (ctx) => {
      const schema = z
        .object({
          name: z.string().min(1).max(60).optional(),
          voiceEnabled: z.boolean().optional(),
          notificationsEnabled: z.boolean().optional(),
          theme: z.enum(['dark', 'light', 'system']).optional(),
          timezone: z.string().optional(),
        })
        .parse(ctx.body);
      const db = await getDb();
      const patch = {};
      if (schema.name) patch.name = schema.name.trim();
      const prefPatch = {};
      if (schema.voiceEnabled !== undefined) prefPatch.voiceEnabled = schema.voiceEnabled;
      if (schema.notificationsEnabled !== undefined) prefPatch.notificationsEnabled = schema.notificationsEnabled;
      if (schema.theme) prefPatch.theme = schema.theme;
      if (schema.timezone) prefPatch.timezone = schema.timezone;

      if (Object.keys(patch).length) {
        await db.collection('users').updateOne({ _id: new ObjectId(ctx.userId) }, { $set: patch });
      }
      if (Object.keys(prefPatch).length) {
        await db
          .collection('preferences')
          .updateOne({ userId: new ObjectId(ctx.userId) }, { $set: { ...prefPatch, updatedAt: new Date().toISOString() } });
      }
      const user = await db.collection('users').findOne({ _id: new ObjectId(ctx.userId) });
      const prefs = await db.collection('preferences').findOne({ userId: user._id });
      return ok({ user: publicUser(user), preferences: pickPrefs(prefs) });
    },
  },
];

function pickPrefs(p) {
  if (!p) return {};
  return {
    voiceEnabled: p.voiceEnabled ?? true,
    notificationsEnabled: p.notificationsEnabled ?? true,
    theme: p.theme ?? 'dark',
    timezone: p.timezone ?? null,
  };
}

export { REFRESH_COOKIE };
