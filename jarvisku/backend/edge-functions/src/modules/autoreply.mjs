import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.mjs';
import { ok, fail, idToStr } from '../lib/http.mjs';

const templateSchema = z.object({
  name: z.string().min(1).max(60),
  trigger: z.enum(['keyword', 'match_all']),
  keywords: z.array(z.string().min(1)).max(20).default([]),
  reply: z.string().min(1).max(500),
  enabled: z.boolean().default(true),
});

const configSchema = z.object({
  enabled: z.boolean(),
  workingHours: z
    .object({
      enabled: z.boolean().optional(),
      start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    })
    .optional(),
});

function toPublicTemplate(t) {
  return {
    _id: idToStr(t._id),
    name: t.name,
    trigger: t.trigger,
    keywords: t.keywords,
    reply: t.reply,
    enabled: t.enabled,
  };
}

export const autoreplyRoutes = [
  {
    method: 'POST',
    path: '/enable',
    run: async (ctx) => {
      const data = configSchema.parse(ctx.body);
      const db = await getDb();
      await db.collection('autoreplies').updateOne(
        { userId: new ObjectId(ctx.userId) },
        { $set: { ...data, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      const row = await db.collection('autoreplies').findOne({ userId: new ObjectId(ctx.userId) });
      return ok({ config: publicConfig(row) });
    },
  },
  {
    method: 'GET',
    path: '/config',
    run: async (ctx) => {
      const db = await getDb();
      const row = await db.collection('autoreplies').findOne({ userId: new ObjectId(ctx.userId) });
      const templates = await db
        .collection('autoreplies')
        .find({ userId: new ObjectId(ctx.userId), kind: 'template' })
        .toArray();
      return ok({ config: publicConfig(row), templates: templates.map(toPublicTemplate) });
    },
  },
  {
    method: 'POST',
    path: '/template',
    run: async (ctx) => {
      const data = templateSchema.parse(ctx.body);
      const db = await getDb();
      const { insertedId } = await db.collection('autoreplies').insertOne({
        ...data,
        kind: 'template',
        userId: new ObjectId(ctx.userId),
        createdAt: new Date().toISOString(),
      });
      const created = await db.collection('autoreplies').findOne({ _id: insertedId });
      return ok({ template: toPublicTemplate(created) });
    },
  },
  {
    method: 'PUT',
    path: '/template/:id',
    run: async (ctx) => {
      const data = templateSchema.partial().parse(ctx.body);
      const db = await getDb();
      const res = await db.collection('autoreplies').findOneAndUpdate(
        { _id: new ObjectId(ctx.params.id), userId: new ObjectId(ctx.userId), kind: 'template' },
        { $set: { ...data, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      if (!res) return fail('Template tidak ditemukan', 404, 'TEMPLATE_NOT_FOUND');
      return ok({ template: toPublicTemplate(res) });
    },
  },
  {
    method: 'DELETE',
    path: '/template/:id',
    run: async (ctx) => {
      const db = await getDb();
      const res = await db
        .collection('autoreplies')
        .deleteOne({ _id: new ObjectId(ctx.params.id), userId: new ObjectId(ctx.userId), kind: 'template' });
      if (!res.deletedCount) return fail('Template tidak ditemukan', 404, 'TEMPLATE_NOT_FOUND');
      return ok({ deleted: true });
    },
  },
  {
    method: 'GET',
    path: '/log',
    run: async (ctx) => {
      const db = await getDb();
      const limit = Math.min(Number(ctx.query?.limit) || 20, 100);
      const rows = await db
        .collection('reply_logs')
        .find({ userId: new ObjectId(ctx.userId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return ok({
        logs: rows.map((l) => ({
          _id: idToStr(l._id),
          platform: l.platform,
          message: l.message,
          reply: l.reply,
          matchedKeyword: l.matchedKeyword,
          createdAt: l.createdAt,
        })),
      });
    },
  },
];

function publicConfig(c) {
  if (!c) {
    return { enabled: false, workingHours: { enabled: false, start: '09:00', end: '18:00' } };
  }
  return {
    enabled: c.enabled ?? false,
    workingHours: c.workingHours || { enabled: false, start: '09:00', end: '18:00' },
  };
}
