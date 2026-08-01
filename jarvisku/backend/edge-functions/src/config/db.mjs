import { MongoClient } from 'mongodb';
import { env } from './env.mjs';

/**
 * Connection-pool singleton. Stateless handlers share one client across
 * warm invocations; cold starts just re-open lazily.
 */
let client = null;
let db = null;

export async function getDb() {
  if (db) return db;
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI not set');
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
