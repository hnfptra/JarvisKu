# API Documentation

Base URL: `https://<backend>/api` · semua request/response JSON. Autentikasi via `Authorization: Bearer <accessToken>` kecuali ditandai 🔓.

> Format respons konsisten: `{ ok: true, data }` sukses, `{ ok: false, error: { code, message } }` gagal.

## Auth

### 🔓 POST /register
```json
{ "name": "Budi", "email": "budi@mail.com", "password": "secret1234" }
```
→ `200` `{ accessToken, refreshToken, user: { _id, name, email, createdAt } }`

### 🔓 POST /login
```json
{ "email": "budi@mail.com", "password": "secret1234" }
```
→ sama seperti register.

### 🔓 POST /refresh
```json
{ "refreshToken": "<refreshToken>" }
```
→ accessToken baru + refreshToken baru (rotasi).

### POST /logout
→ `{ revoked: true }` · refresh token dihapus.

### GET /profile
→ `{ user, preferences: { voiceEnabled, notificationsEnabled, theme, timezone } }`

### PUT /profile
Body opsional: `name`, `voiceEnabled`, `notificationsEnabled`, `theme` (`dark|light|system`), `timezone`.

## Assistant

### POST /assistant/chat
```json
{ "message": "Jadwalkan meeting 2 siang", "conversationId": "<optional>" }
```
→ `{ conversationId, reply }` · tanpa `conversationId`, sesi baru dibuat.

### POST /assistant/speech
```json
{ "audio": "<base64>", "mimeType": "audio/m4a", "tts": true }
```
→ `{ conversationId, text, reply, audioBase64 }` · `text` = hasil STT, `audioBase64` = MP3 bila `tts`.

### POST /assistant/tts
```json
{ "text": "Halo" }
```
→ `{ audioBase64 }`

### GET /assistant/history?limit=20&summary=false
→ `{ conversations: [{ _id, title, messages[], summary, createdAt, updatedAt }] }`

### GET /assistant/history/:id
→ `{ conversation: { _id, title, messages[], summary } }`

### DELETE /assistant/history/:id
→ `{ deleted: true }`

## Auto Reply

### POST /autoreply/enable
```json
{ "enabled": true, "workingHours": { "enabled": true, "start": "09:00", "end": "18:00" } }
```
→ `{ config }`

### GET /autoreply/config
→ `{ config, templates: [{ _id, name, trigger, keywords[], reply, enabled }] }`

### POST /autoreply/template
```json
{ "name": "Harga", "trigger": "keyword", "keywords": ["harga"], "reply": "Cek dulu ya", "enabled": true }
```
`trigger`: `keyword` | `match_all`.

### PUT /autoreply/template/:id · DELETE /autoreply/template/:id
Update / hapus template.

### GET /autoreply/log?limit=20
→ `{ logs: [{ _id, platform, message, reply, matchedKeyword, createdAt }] }`

## Social

### GET /social/providers
→ `{ providers: ["mock"] }`

### POST /social/connect
```json
{ "platform": "whatsapp", "username": "@budi", "token": "<optional>" }
```
`platform`: `instagram` | `whatsapp` | `telegram` | `discord` | `messenger`.

### POST /social/disconnect
```json
{ "platform": "whatsapp" }
```

### GET /social/accounts
→ `{ accounts: [{ _id, platform, username, status, connectedAt }] }`

### GET /social/messages
→ `{ messages: [{ _id, platform, from, text, autoReplied, reply, createdAt }] }`

### POST /social/ingest
```json
{ "platform": "whatsapp", "from": "Dina", "text": "Halo, ready?" }
```
Webhook inbound → menjalankan auto-reply engine bila aktif.

## Premium

### 🔓 GET /plans
→ `{ plans: [{ id, name, price, features[] }] }`

### GET /subscription
→ `{ subscription: { plan, status, renewsAt } }`

### POST /subscribe
```json
{ "plan": "pro" }
```
Simulasi MVP — mengubah paket tanpa pembayaran.

## Dashboard

### GET /dashboard
→ agregat sekali panggil: `{ user, subscription, social: { connected, accounts }, automation: { enabled, templateCount }, recentActivity[] }`

## Kode Error Umum

| Code | Status | Kapan |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | login salah |
| `UNAUTHORIZED` | 401 | token hilang/kadaluarsa |
| `EMAIL_EXISTS` | 409 | email sudah terdaftar |
| `VALIDATION_ERROR` | 400 | body tidak valid |
| `RATE_LIMITED` | 429 | terlalu banyak request |
| `CONVERSATION_NOT_FOUND` | 404 | id salah / bukan milik user |
