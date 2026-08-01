# Deployment Guide

## Opsi Deploy

| Backend | Frontend | Caranya |
|---|---|---|
| **Netlify Functions** (default) | Netlify static / Expo web | tutorial di bawah |
| Vercel Edge Functions | Netlify / Vercel | `vercel/api.js` sudah disiapkan |

Backend **stateless** → identik di kedua platform, tinggal pindah adapter.

## Netlify (Default)

### 1. Buat 2 situs Netlify

- **Backend**: base dir `backend/edge-functions` (dikenali `netlify.toml` + `netlify/functions/`).
- **Frontend**: hasil `expo export --platform web` di `apps/mobile/dist`.

### 2. Env vars (Site settings → Environment)

Backend: `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `CORS_ORIGIN`.
Frontend build: `EXPO_PUBLIC_API_URL=https://<backend-site>.netlify.app`.

### 3. GitHub Actions — otomatis

Push ke `main`:

```
Push → lint+typecheck+test (backend) / typecheck (mobile) → deploy edge functions → build web → deploy web
```

Secrets yang perlu diset di repo:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_BACKEND_SITE_ID`
- `NETLIFY_FRONTEND_SITE_ID`
- `EXPO_PUBLIC_API_URL`
- `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`

### 4. Verifikasi

```bash
curl https://<backend-site>.netlify.app/api/health
# {"ok":true,"data":{"status":"up"}}
```

## Vercel (Alternatif)

```bash
cd backend/edge-functions
vercel --prod        # deploy vercel/api.js sebagai edge function
```

Set env yang sama di dashboard Vercel. Frontend sama seperti Netlify (Expo web build).

## Manual (tanpa CI)

```bash
# backend
cd backend/edge-functions && netlify deploy --prod --dir . --functions netlify/functions

# frontend web
cd apps/mobile
EXPO_PUBLIC_API_URL=https://<backend>.netlify.app npx expo export --platform web
netlify deploy --prod --dir dist
```

## Catatan Edge

- Handler Netlify `netlify/functions/api.mjs` dan Vercel `vercel/api.js` memakai **satu** router (`buildRouter`) → perilaku API identik.
- Koneksi Mongo di-cache antar warm invocation (`src/config/db.mjs`).
- Rate limiter in-memory → untuk multi-region besar ganti dengan Upstash Redis.
