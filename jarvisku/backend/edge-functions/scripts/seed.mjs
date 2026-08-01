/**
 * Seeds a demo user + sample data. Run: npm run seed
 * Requires MONGODB_URI in env (or .env.local loaded by the script).
 */
import { config } from 'dotenv';
config();
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI first.');
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db();

const email = 'demo@jarvisku.app';
const existing = await db.collection('users').findOne({ email });
if (existing) {
  console.log('Demo user exists, skipping.');
  await client.close();
  process.exit(0);
}

const now = new Date().toISOString();
const { insertedId } = await db.collection('users').insertOne({
  name: 'Demo User',
  email,
  passwordHash: await bcrypt.hash('demo1234', 10),
  plan: 'free',
  createdAt: now,
});
await db.collection('preferences').insertOne({
  userId: insertedId,
  voiceEnabled: true,
  notificationsEnabled: true,
  theme: 'dark',
  refreshToken: null,
  createdAt: now,
});
await db.collection('autoreplies').insertMany([
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
console.log('Seeded demo@jarvisku.app / demo1234');
await client.close();
