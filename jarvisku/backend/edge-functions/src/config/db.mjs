import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { env } from './env.mjs';

/**
 * Connection-pool singleton. Stateless handlers share one client across
 * warm invocations; cold starts just re-open lazily.
 *
 * ponytail: Demo mode. When MONGODB_URI is empty/placeholder, falls back to an
 * in-memory DB so the whole app works without Atlas. Data resets on restart.
 * Upgrade path: point MONGODB_URI at Atlas → real Mongo used automatically.
 */
let client = null;
let db = null;

export function isMemoryMode() {
  const uri = env.MONGODB_URI;
  return !uri || !uri.startsWith('mongodb') || uri.includes('<user>');
}

export async function getDb() {
  if (db) return db;
  if (isMemoryMode()) {
    db = new MemoryDb();
    await seedDemo(db);
    console.log('[db] in-memory demo mode (no MONGODB_URI)');
    return db;
  }
  client = new MongoClient(env.MONGODB_URI, { maxPoolSize: 1 });
  await client.connect();
  db = client.db();
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

async function seedDemo(memoryDb) {
  const existing = await memoryDb.collection('users').findOne({ email: 'demo@jarvisku.app' });
  if (existing) return;
  const now = new Date().toISOString();
  const { insertedId } = await memoryDb.collection('users').insertOne({
    name: 'Demo User',
    email: 'demo@jarvisku.app',
    passwordHash: await bcrypt.hash('demo1234', 10),
    plan: 'free',
    createdAt: now,
  });
  await memoryDb.collection('preferences').insertOne({
    userId: insertedId,
    voiceEnabled: true,
    notificationsEnabled: true,
    theme: 'dark',
    refreshToken: null,
    createdAt: now,
  });
  await memoryDb.collection('autoreplies').insertMany([
    {
      userId: insertedId,
      kind: 'template',
      name: 'AFK',
      trigger: 'match_all',
      keywords: [],
      reply: 'Halo! Aku lagi AFK, nanti aku balas ya 🙌',
      enabled: true,
      createdAt: now,
    },
    {
      userId: insertedId,
      kind: 'template',
      name: 'Harga',
      trigger: 'keyword',
      keywords: ['harga', 'berapa', 'price'],
      reply: 'Untuk info harga, tunggu sebentar ya, aku cek dulu 👍',
      enabled: true,
      createdAt: now,
    },
  ]);
}

/* ---------------- In-memory DB (demo only) ---------------- */

function eq(a, b) {
  if (a instanceof ObjectId || b instanceof ObjectId) return a?.toString() === b?.toString();
  return a === b;
}

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }

  _match(doc, filter = {}) {
    for (const [k, v] of Object.entries(filter)) {
      if (v === undefined) continue;
      const dv = doc[k];
      if (v && typeof v === 'object' && !(v instanceof ObjectId) && '$in' in v) {
        if (!v.$in.some((x) => eq(x, dv))) return false;
      } else if (!eq(dv, v)) {
        return false;
      }
    }
    return true;
  }

  findOne(filter) {
    return this.docs.find((d) => this._match(d, filter)) ?? null;
  }

  find(filter = {}) {
    let docs = this.docs.filter((d) => this._match(d, filter));
    const cursor = {
      sort(spec) {
        const [k, dir] = Object.entries(spec)[0] ?? [];
        if (k) {
          docs = [...docs].sort((a, b) => (a[k] < b[k] ? -dir : a[k] > b[k] ? dir : 0));
        }
        return cursor;
      },
      limit(n) {
        docs = docs.slice(0, n);
        return cursor;
      },
      toArray: async () => docs,
    };
    return cursor;
  }

  async insertOne(doc) {
    const d = { ...doc };
    if (!d._id) d._id = new ObjectId();
    this.docs.push(d);
    return { insertedId: d._id };
  }

  async insertMany(docs) {
    const insertedIds = [];
    for (const d of docs) {
      const { insertedId } = await this.insertOne(d);
      insertedIds.push(insertedId);
    }
    return { insertedIds };
  }

  async updateOne(filter, update, opts = {}) {
    const doc = this.docs.find((d) => this._match(d, filter));
    if (!doc) {
      if (opts.upsert) {
        const base = {};
        for (const [k, v] of Object.entries(filter)) if (v !== undefined) base[k] = v;
        const set = update.$set ?? {};
        await this.insertOne({ ...base, ...set });
      }
      return { matchedCount: 0, upsertedCount: opts.upsert ? 1 : 0 };
    }
    applyUpdate(doc, update);
    return { matchedCount: 1 };
  }

  async findOneAndUpdate(filter, update, opts = {}) {
    const doc = this.docs.find((d) => this._match(d, filter));
    if (!doc) return null;
    applyUpdate(doc, update);
    return opts.returnDocument === 'after' ? doc : null;
  }

  async deleteOne(filter) {
    const i = this.docs.findIndex((d) => this._match(d, filter));
    if (i === -1) return { deletedCount: 0 };
    this.docs.splice(i, 1);
    return { deletedCount: 1 };
  }
}

function applyUpdate(doc, update) {
  if (update.$set) Object.assign(doc, update.$set);
  if (update.$push) {
    for (const [k, v] of Object.entries(update.$push)) {
      if (v && typeof v === 'object' && '$each' in v) {
        doc[k] = [...(doc[k] ?? []), ...v.$each];
      } else {
        doc[k] = [...(doc[k] ?? []), v];
      }
    }
  }
}

class MemoryDb {
  constructor() {
    this._cols = new Map();
  }
  collection(name) {
    if (!this._cols.has(name)) this._cols.set(name, new MemoryCollection(name));
    return this._cols.get(name);
  }
}

export { ObjectId };
