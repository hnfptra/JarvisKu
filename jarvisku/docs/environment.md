# Environment Setup

## Backend — `backend/edge-functions/.env`

```env
# wajib untuk data nyata
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/jarvisku
JWT_SECRET=<random panjang, minimal 32 char>

# OpenAI — tanpa ini, AI jawab fallback & voice STT/TTS nonaktif
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# opsional
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:8081
PORT=8888
```

### Generate JWT secret

```bash
openssl rand -hex 48
```

## Mobile — `apps/mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:8888   # dev
# EXPO_PUBLIC_API_URL=https://<backend>.netlify.app  # prod
```

`EXPO_PUBLIC_*` di-embed saat build. Variabel lain (`JWT`, `MONGODB`) **tidak boleh** ada di client.

## Prod (Netlify)

Set di dashboard / GitHub secrets, lihat [deployment.md](deployment.md).

| Var | Backend | Frontend build |
|---|---|---|
| `MONGODB_URI` | ✅ | |
| `JWT_SECRET` | ✅ | |
| `OPENAI_API_KEY` | ✅ | |
| `CORS_ORIGIN` | ✅ | |
| `EXPO_PUBLIC_API_URL` | | ✅ |

## Menjalankan seed

```bash
npm run seed   # demo@jarvisku.app / demo1234 + 2 template autoreply
```
