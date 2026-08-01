# Arsitektur

## Diagram Level Tinggi

```
┌─────────────────────────────┐      HTTPS + JSON      ┌──────────────────────────────┐
│  React Native (Expo)        │  ───────────────────►  │  Edge Functions (stateless)  │
│                             │                        │                              │
│  Presentation  · screens    │                        │  Router (app.mjs)            │
│  UI            · components │                        │   ├─ lib/http (responses,    │
│  State         · Zustand    │                        │   │    rate-limit, CORS)     │
│  Data          · RQ hooks   │                        │   ├─ lib/auth (JWT, bcrypt)  │
│  API           · endpoints  │                        │   └─ lib/ai (OpenAI relay)   │
└─────────────┬───────────────┘                        └───────────────┬──────────────┘
              │                                          modules (routes) │
              │                                          auth · assistant · autoreply · social · premium · dashboard
              │                                                    │
              │                                          services (business logic)
              │                                          social/adapter · autoreply/engine
              │                                                    │
              │                                          MongoDB Atlas (native driver)
```

## Clean Architecture di Backend

| Layer | Isi | Contoh file |
|---|---|---|
| **API / HTTP** | router, adapters, CORS, rate limit | `src/app.mjs`, `src/router.mjs`, `netlify/functions/api.mjs` |
| **Business Logic** | pure modules + services | `src/modules/*`, `src/services/*` |
| **Service** | domain logic tak terkait route | `services/autoreply/engine.mjs`, `services/social/adapter.mjs` |
| **Repository/DB** | akses Mongo via driver | `src/config/db.mjs`, langsung di module |
| **Config** | env + connection | `src/config/env.mjs` |

Frontend memisahkan: `app/` (routes/screens), `components/` (UI), `store/` (Zustand), `lib/api/` (endpoints + client), `hooks/`.

## Alur Data — Chat Suara

```
User menekan mic
 → expo-av record (lib/voice.ts)
 → POST /api/assistant/speech { audio: base64, mimeType }
 → module assistant: transcribeAudio (Whisper) → chatCompletion (history context)
 → simpan ke conversations → reply
 → tts=true → TTS MP3 base64 → playAudioBase64 (expo-av)
```

## Alur Data — Balas Otomatis

```
Provider kirim pesan masuk
 → POST /api/social/ingest
 → service autoreply/engine: cek enabled → working hours → keyword/match_all template
 → cocok? → kirim balasan via adapter + catat reply_logs + tandai autoReplied
```

## Koneksi Sosial — Adapter Pattern

Setiap platform mengimplementasikan interface:

```js
{ name, label, fetchInbox(credentials), sendReply(account, messageId, text) }
```

Daftarkan di `services/social/adapter.mjs`. Router dan core tidak berubah saat menambah platform. MVP memakai provider `mock`; Instagram/WhatsApp/Telegram/Discord/Messenger menimpa `fetchInbox`/`sendReply` dengan API aslinya.

## Keamanan

- JWT access (15m) + refresh rotation (30d) — refresh di-rotate tiap pemakaian.
- Password di-hash bcrypt (cost 10).
- Zod validation di setiap body.
- Rate limit in-memory per user / per IP.
- CORS origin dari env.
- Semua secret via env var, tidak ada hardcode.
