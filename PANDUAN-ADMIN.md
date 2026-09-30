# Panel Admin — Sumberejo Organik

Panel admin (React) sudah menyatu di repo ini. Ia login ke backend FastAPI lalu menampilkan seluruh
data backend — kategori, produk & varian, pemasok, penerimaan bahan baku, penggilingan, hasil giling,
pengemasan, pesanan, penyesuaian stok, dan laporan — dalam bentuk tabel, lengkap dengan form tambah
data dan aksi penting (konfirmasi/tolak pesanan, lolos/retur mutu bahan baku).

Semua fitur admin memakai endpoint yang ada di `backend/app/routers/*.py`.

## 1. Siapkan backend

Akun admin **hanya** dibuat lewat script `create_admin.py`. Dari folder `backend/`:

```bash
cp .env.example .env
```

Isi `backend/.env`:

```
SECRET_KEY=isi-dengan-string-acak-yang-panjang
DB_ROOT_PASSWORD=password-database-yang-kuat
DATABASE_URL=mysql+pymysql://root:password-database-yang-kuat@localhost:3308/rejonik
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password-yang-kuat
ADMIN_WA_NUMBER=6281xxxxxxxxxx
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

`DB_ROOT_PASSWORD` dipakai `docker-compose.yml` untuk MySQL, jadi password di `DATABASE_URL`
harus sama dengannya.

Lalu jalankan (butuh MySQL aktif — paling gampang lewat `docker compose up -d db` di folder `backend/`):

```bash
pip install -r requirements.txt
alembic upgrade head        # membuat/memperbarui semua tabel (termasuk kolom orders.metode)
python create_admin.py      # membuat akun admin pertama dari ADMIN_USERNAME/ADMIN_PASSWORD di .env
uvicorn app.main:app --reload
```

Backend berjalan di `http://localhost:8000`.

> Database lama: `alembic upgrade head` menambahkan kolom `metode` ke tabel `orders`; pesanan yang
> sudah ada otomatis dianggap `kirim`.

## 2. Siapkan frontend

Dari folder `Frontend/`:

```bash
cp .env.example .env    # isinya VITE_API_URL=http://localhost:8000, sesuaikan kalau beda
npm install
npm run dev
```

## 3. Login

Buka `http://localhost:5173/admin/login` (atau tombol **Login Admin** di navbar situs), masuk dengan
`ADMIN_USERNAME` / `ADMIN_PASSWORD` dari `backend/.env`. Setelah masuk, otomatis ke `/admin` (dashboard).
Semua halaman `/admin/*` dilindungi — kalau belum login atau token kedaluwarsa (berlaku 60 menit, sesuai
`ACCESS_TOKEN_EXPIRE_MINUTES` di `backend/app/security.py`), Anda dilempar balik ke halaman login.

## 4. Daftar halaman

| Halaman | Rute | Isi |
|---|---|---|
| Dashboard | `/admin` | Ringkasan angka + pesanan terbaru |
| Kategori | `/admin/kategori` | Daftar kategori + tambah/hapus |
| Produk & Varian | `/admin/produk` | Produk beserta varian berat/harga/stok + tambah/hapus |
| Pemasok | `/admin/pemasok` | Daftar pemasok + tambah |
| Penerimaan Bahan Baku | `/admin/penerimaan` | Riwayat gabah masuk + tambah + tombol Lolos/Retur mutu |
| Penggilingan | `/admin/penggilingan` | Riwayat giling + tambah (dari bahan baku yang sudah lolos mutu) |
| Hasil Giling | `/admin/hasil-giling` | Rekap beras hasil giling yang belum dikemas (read-only) |
| Pengemasan | `/admin/pengemasan` | Riwayat kemas + tambah |
| Pesanan | `/admin/order` | Semua pesanan (kirim / ambil sendiri), filter status, Konfirmasi (ongkir hanya untuk pengiriman) / Tolak, tombol Chat pembeli via WhatsApp; daftar diperbarui otomatis tiap 15 detik |
| Penyesuaian Stok | `/admin/penyesuaian-stok` | Riwayat pengurangan stok (rusak/hilang/dll) + tambah |
| Laporan | `/admin/laporan` | Laporan penjualan (produk terkonfirmasi) + stok menipis/habis |

## Catatan

- Alamat backend dibaca dari `VITE_API_URL` di `Frontend/.env`. Kalau tidak diisi, default-nya `http://localhost:8000`.
- Token login admin disimpan di `localStorage` browser (key `rejonik_admin_token`).
- Pembeli memesan lewat halaman publik `/pesan` (pilih **Kirim ke alamat** atau **Ambil sendiri**), lalu
  admin memprosesnya di `/admin/order`.
