# Aplikasi Rejonik — Sumberejo Organik

Situs toko beras organik: halaman publik, pemesanan online, dan panel admin, dengan backend FastAPI + MySQL.

## Struktur

| Folder | Isi |
|---|---|
| `Frontend/` | React + Vite + Tailwind. `src/pages/` = halaman publik & halaman pesan, `src/admin/` = panel admin, `src/lib/api.js` = klien API halaman publik |
| `backend/` | FastAPI + SQLAlchemy + Alembic (migrasi database) |
| `Testing/` | Test case (`*.md`) dan tes Playwright (`Testing/Tes-Frontend`) |

## Rute frontend

| Rute | Halaman |
|---|---|
| `/`, `/produk`, `/keunggulan`, `/tentang`, `/sertifikat`, `/kontak` | Situs publik |
| `/pesan` | Pemesanan (kirim ke alamat / ambil sendiri) + pelacakan status pesanan |
| `/admin/login`, `/admin/*` | Panel admin (lihat `PANDUAN-ADMIN.md`) |

Alamat yang tidak dikenal diarahkan kembali ke beranda.

## Menjalankan

Langkah lengkap (env, database, akun admin) ada di [`PANDUAN-ADMIN.md`](PANDUAN-ADMIN.md). Ringkasnya:

```bash
# backend/
cp .env.example .env            # lalu isi nilainya
docker compose up -d db
pip install -r requirements.txt
alembic upgrade head
python create_admin.py
uvicorn app.main:app --reload

# Frontend/
cp .env.example .env
npm install
npm run dev
```

Riwayat penggabungan beberapa versi kode ke repo ini ada di [`CATATAN-PENGGABUNGAN.md`](CATATAN-PENGGABUNGAN.md).
