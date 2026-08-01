import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.mjs';
import { ok, fail, idToStr } from '../lib/http.mjs';
import { getProvider, listProviders } from '../services/social/adapter.mjs';
import { matchAutoReply } from '../services/autoreply/engine.mjs';

const PLATFORMS = ['instagram', 'whatsapp', 'telegram', 'discord', 'messenger'];

const connectSchema = z.object({
  platform: z.enum(PLATFORMS),
  username: z.string().min(1).max(80),
  token: z.string().optional(),
});

export const socialRoutes = [
  {
    method: 'GET',
    path: '/providers',
    run: () => ok({ providers: listProviders() }),
  },
  {
    method: 'POST',
    path: '/connect',
    run: async (ctx) => {
      const data = connectSchema.parse(ctx.body);
      const db = await getDb();
      const exists = await db
        .collection('social_accounts')
        .findOne({ userId: new ObjectId(ctx.userId), platform: data.platform });
      if (exists) return fail(`Akun ${data.platform} sudah terhubung`, 409, 'ALREADY_CONNECTED');

      const provider = getProvider('mock');
      const account = {
        userId: new ObjectId(ctx.userId),
        platform: data.platform,
        username: data.username.trim(),
        providerToken: data.token || null,
        adapter: 'mock',
        status: 'active',
        connectedAt: new Date().toISOString(),
      };
      const { insertedId } = await db.collection('social_accounts').insertOne(account);
      void provider; // real adapters would validate credentials here
      const created = await db.collection('social_accounts').findOne({ _id: insertedId });
      return ok({ account: toPublic(created) });
    },
  },
  {
    method: 'DELETE',
    path: '/disconnect',
    run: async (ctx) => {
      const data = z.object({ platform: z.enum(PLATFORMS) }).parse(ctx.body);
      const db = await getDb();
      const res = await db
        .collection('social_accounts')
        .deleteOne({ userId: new ObjectId(ctx.userId), platform: data.platform });
      if (!res.deletedCount) return fail('Akun tidak ditemukan', 404, 'ACCOUNT_NOT_FOUND');
      return ok({ deleted: true });
    },
  },
  {
    method: 'GET',
    path: '/accounts',
    run: async (ctx) => {
      const db = await getDb();
      const rows = await db
        .collection('social_accounts')
        .find({ userId: new ObjectId(ctx.userId) })
        .toArray();
      return ok({ accounts: rows.map(toPublic) });
    },
  },
  {
    method: 'GET',
    path: '/messages',
    run: async (ctx) => {
      const db = await getDb();
      const rows = await db
        .collection('messages')
        .find({ userId: new ObjectId(ctx.userId) })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
      return ok({ messages: rows.map(toPublicMessage) });
    },
  },
  {
    method: 'POST',
    path: '/ingest',
    run: async (ctx) => {
      // Webhook-style entry point used by providers. In MVP, the mock "fetch"
      // simulates inbound messages. Auto-reply engine runs here.
      const data = z
        .object({
          platform: z.enum(PLATFORMS),
          from: z.string().min(1),
          text: z.string().min(1).max(2000),
        })
        .parse(ctx.body);
      const db = await getDb();
      const account = await db
        .collection('social_accounts')
        .findOne({ userId: new ObjectId(ctx.userId), platform: data.platform });

      const now = new Date().toISOString();
      const doc = {
        userId: new ObjectId(ctx.userId),
        platform: data.platform,
        from: data.from,
        text: data.text,
        autoReplied: false,
        createdAt: now,
      };

      if (account) {
        const match = await matchAutoReply(db, ctx.userId, data.text);
        if (match) {
          const provider = getProvider(account.adapter || 'mock');
          await provider.sendReply(account, null, match.reply);
          doc.autoReplied = true;
          doc.reply = match.reply;
          await db.collection('reply_logs').insertOne({
            userId: new ObjectId(ctx.userId),
            platform: data.platform,
            message: data.text,
            reply: match.reply,
            matchedKeyword: match.keyword || null,
            createdAt: now,
          });
        }
      }

      const { insertedId } = await db.collection('messages').insertOne(doc);
      const saved = await db.collection('messages').findOne({ _id: insertedId });
      return ok({ message: toPublicMessage(saved) });
    },
  },
];

function toPublic(a) {
  return {
    _id: idToStr(a._id),
    platform: a.platform,
    username: a.username,
    status: a.status,
    connectedAt: a.connectedAt,
  };
}

function toPublicMessage(m) {
  return {
    _id: idToStr(m._id),
    platform: m.platform,
    from: m.from,
    text: m.text,
    autoReplied: m.autoReplied ?? false,
    reply: m.reply || null,
    createdAt: m.createdAt,
  };
}
