# Developer Guide

## Setup Awal

```bash
# persyaratan
node >= 20
npm >= 10
Expo Go di device (atau emulator)

npm run install:all
cp backend/edge-functions/.env.example backend/edge-functions/.env   # isi
cp apps/mobile/.env.example apps/mobile/.env                          # isi
npm run dev:backend   # terminal 1
npm run dev:mobile    # terminal 2
```

## Coding Standard

- **TypeScript strict** (`tsconfig` strict). Backend `.mjs` + JSDoc (runs on any edge runtime).
- **ESLint + Prettier** via `expo lint` dan eslint config backend.
- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- **Husky + lint-staged**: lint otomatis saat commit; commitlint validasi format pesan.

### Alur commit

```bash
git add .
git commit -m "feat(assistant): tambah history summary"
# pre-commit: eslint --fix
# commit-msg: commitlint
```

## Menambahkan Route Backend

1. Buat `src/modules/<name>.mjs` → export array `[{ method, path, public?, limit?, run(ctx) }]`.
2. Daftarkan di `src/app.mjs` (groups array).
3. Jalankan test: `npm test`.

`ctx` = `{ params, query, body, headers, userId }`.

## Menambahkan Platform Sosial

1. Implementasikan interface adapter di `src/services/social/adapter.mjs`.
2. Daftarkan `registerProvider('instagram', {...})`.
3. `POST /social/connect` otomatis memakai adapter tsb; ganti `adapter: 'mock'` saat insert.

## Menambahkan Screen Mobile

1. Route: file di `apps/mobile/app/`. Stack → root `_layout.tsx`; tab → `app/(tabs)/`.
2. UI pakai komponen `components/ui/*` (Card, Button, Text, Icon, Skeleton, EmptyState).
3. Data: query hook di `lib/api/endpoints.ts` + `useQuery`; state global di `store/`.

## Testing

```bash
# backend: node:test
npm --prefix backend/edge-functions test

# mobile: jest-expo
npm --prefix apps/mobile test
```

`tests/autoreply-engine.test.mjs` — pure logic (matching engine), tanpa DB/network.

## Typecheck

```bash
npm run typecheck      # mobile + backend
```

## Performance (sudah diterapkan)

- Virtualized lists (`FlatList`) untuk history/inbox.
- Lazy: tab screens terpisah, `useQuery` cache (stale 30s).
- Debounce di input komposer, memoized query keys.
- Skeleton loading vs spinner — tanpa flicker.
- `expo-av` untuk audio, tanpa dependensi ekstra.
- NativeWind tree-shake kelas.

## Checklist "Shippable"

- [ ] `npm run typecheck` lolos
- [ ] `npm test` lolos
- [ ] `npm run lint` bersih
- [ ] Health check `/api/health` → `{"ok":true}`
- [ ] Login + chat + autoreply E2E manual
