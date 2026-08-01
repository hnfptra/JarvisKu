# Database Schema — MongoDB Atlas

Koneksi: native driver (`mongodb`). Setiap dokumen membawa `userId` (ObjectId) untuk isolasi data per user. Timestamp ISO string.

## Koleksi

### users
```js
{
  _id: ObjectId,
  name: string,
  email: string,            // lowercased, unique
  passwordHash: string,     // bcrypt
  plan: 'free' | 'pro',
  subscriptionUpdatedAt?: string,
  createdAt: string
}
```
Indeks: `email` unique.

### preferences
```js
{
  _id: ObjectId,
  userId: ObjectId,
  voiceEnabled: boolean,
  notificationsEnabled: boolean,
  theme: 'dark' | 'light' | 'system',
  timezone?: string | null,
  refreshToken?: string | null,   // untuk rotasi JWT
  createdAt: string,
  updatedAt: string
}
```
Indeks: `userId` unique.

### conversations
```js
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  messages: [
    { role: 'user' | 'assistant', content: string, createdAt: string }
  ],
  summary?: string | null,
  createdAt: string,
  updatedAt: string
}
```
Indeks: `{ userId: 1, updatedAt: -1 }`.

### social_accounts
```js
{
  _id: ObjectId,
  userId: ObjectId,
  platform: 'instagram'|'whatsapp'|'telegram'|'discord'|'messenger',
  username: string,
  providerToken?: string,
  adapter: 'mock' | string,     // nama adapter aktif
  status: 'active' | 'error',
  connectedAt: string
}
```
Indeks: `{ userId: 1, platform: 1 }` unique.

### messages
```js
{
  _id: ObjectId,
  userId: ObjectId,
  platform: string,
  from: string,
  text: string,
  autoReplied: boolean,
  reply?: string | null,
  createdAt: string
}
```
Indeks: `{ userId: 1, createdAt: -1 }`.

### autoreplies — dua bentuk dalam satu koleksi
Dokumen **config** (satu per user):
```js
{ userId, enabled: boolean, workingHours: { enabled, start, end }, updatedAt }
```
Dokumen **template** (`kind: 'template'`):
```js
{ userId, kind: 'template', name, trigger: 'keyword'|'match_all', keywords: string[], reply, enabled, createdAt }
```
Indeks: `{ userId: 1 }`.

### reply_logs
```js
{
  _id: ObjectId,
  userId: ObjectId,
  platform: string,
  message: string,
  reply: string,
  matchedKeyword?: string | null,
  createdAt: string
}
```

### subscriptions
```js
{
  _id: ObjectId,
  userId: ObjectId,
  plan: 'free' | 'pro',
  status: 'active' | 'trialing' | 'expired',
  renewsAt: string
}
```
(MVP: status utama dibaca dari `users.plan`; koleksi ini arsip transisi.)

### plans
Data statis di kode (`premium.mjs`) — koleksi dicadangkan bila harga perlu dikelola dari DB.

### logs
Opsional, untuk audit/observability di masa depan.

## Catatan MVP

- Tidak ada relasi `$lookup`; query per koleksi dilakukan paralel (`Promise.all` di dashboard).
- Indeks di atas cukup untuk skala pribadi; perbesar dengan sharding/TTL (riwayat) saat multi-user.
