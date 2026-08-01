# 🤖 JarvisKu

Asisten pribadi berbasis AI untuk orang dengan mobilitas tinggi — **cepat, minim klik, siap dipakai sambil berjalan**. Dark-first, satu tangan, performa tinggi.

MVP yang bisa dijalankan sekarang: **Asisten Suara**, **Balas Otomatis**, **Akun Saya**. Modul **Sosial Media** memakai arsitektur adapter (mock), **Premium** simulasi.

---

## Teknologi

| Layer | Stack |
|---|---|
| Mobile | React Native · Expo SDK 51 · TypeScript strict · Expo Router · NativeWind · TanStack Query · Zustand · Reanimated |
| Backend | Edge Functions (Node runtime) · REST · Zod · Mongo driver · JWT refresh rotation |
| Database | MongoDB Atlas (native driver) |
| Deploy | Netlify Functions + Netlify static (alternatif: Vercel Edge) |
| CI/CD | GitHub Actions · ESLint · tsc · commitlint · husky |

## Struktur

```
jarvisku/
├── apps/mobile/             # Expo React Native app
├── backend/edge-functions/  # REST API (Netlify/Vercel edge, stateless)
│   ├── src/modules/         # route groups: auth, assistant, autoreply, social, premium, dashboard
│   ├── src/services/        # business logic: social adapter, autoreply engine
│   ├── src/lib/             # http, auth, ai helpers
│   ├── netlify/ + vercel/   # platform adapters
│   └── tests/               # node:test unit tests
├── packages/shared/         # shared contract types (reference only)
├── docs/                    # documentation
└── .github/workflows/ci.yml # pipeline
```

## Jalankan Lokal

Butuh: Node 20+, MongoDB Atlas URI, (opsional) OpenAI API key.

```bash
# 1. install semua dependensi
npm run install:all

# 2. backend
cp backend/edge-functions/.env.example backend/edge-functions/.env
# isi MONGODB_URI, JWT_SECRET, OPENAI_API_KEY
npm run dev:backend            # http://localhost:8888

# 3. mobile
cp apps/mobile/.env.example apps/mobile/.env   # EXPO_PUBLIC_API_URL=http://localhost:8888
npm run dev:mobile             # Expo (QR → Expo Go)

# seed demo user (opsional)
npm run seed                   # demo@jarvisku.app / demo1234
```

Health check: `curl http://localhost:8888/api/health`

## Deploy (Netlify)

1. Buat 2 situs Netlify: **backend** (`backend/edge-functions`) dan **frontend** (build web).
2. Set environment & secrets di GitHub: `NETLIFY_AUTH_TOKEN`, `NETLIFY_BACKEND_SITE_ID`, `NETLIFY_FRONTEND_SITE_ID`, `EXPO_PUBLIC_API_URL`, `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`.
3. Push ke `main` → GitHub Actions deploy otomatis.

Dokumentasi lengkap: [docs/index.md](docs/index.md)

## Akun Demo

| | |
|---|---|
| Email | `demo@jarvisku.app` |
| Password | `demo1234` |

## Lisensi

Pribadi / internal. Belum untuk komersial.
