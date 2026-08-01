# JarvisKu — Dokumentasi

| | |
|---|---|
| [Arsitektur](architecture.md) | Diagram sistem, clean architecture, alur data |
| [API](api.md) | Endpoint REST, request/response, auth |
| [Database](database.md) | Skema MongoDB, koleksi, indeks |
| [Deployment](deployment.md) | Netlify, Vercel, GitHub Actions |
| [Environment](environment.md) | Semua env var, lokal + produksi |
| [Developer Guide](developer.md) | Setup, coding standard, testing, workflow |

---

## Ringkasan

- **MVP-first**: 3 modul inti (Asisten Suara, Balas Otomatis, Akun Saya) lengkap. Sosial = adapter mock. Premium = simulasi.
- **Backend stateless**: semua handler murni, koneksi Mongo di-cache, siap dipindah Netlify ↔ Vercel.
- **Satu REST API**: satu router, dua adapter (Netlify `netlify/functions/api.mjs`, Vercel `vercel/api.js`), dan dev server lokal `src/server.mjs` — behaviour identik.
- **Dark-first design system**: palet di `lib/theme.tsx` + `tailwind.config.js`, komponen di `components/ui/`.
