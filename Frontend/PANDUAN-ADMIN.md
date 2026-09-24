# Panel Admin — Sumberejo Organik

Paket ini berisi halaman admin (React) yang login ke backend FastAPI yang sudah ada di
repo Anda, lalu menampilkan seluruh data backend (kategori, produk & varian, pemasok,
penerimaan bahan baku, penggilingan, hasil giling, pengemasan, pesanan, penyesuaian
stok, dan laporan) dalam bentuk tabel — lengkap dengan form tambah data dan aksi-aksi
penting (konfirmasi/tolak pesanan, lolos/retur mutu bahan baku).

Tidak ada file backend yang diubah. Semua fitur di sini murni memakai endpoint yang
sudah ada di `backend/app/routers/*.py`.

## 1. Pasang ke proyek Anda

Ekstrak zip ini, lalu salin/timpa ke folder proyek Anda (struktur foldernya sudah
sama persis dengan repo Anda):

```
Frontend/src/admin/        → folder baru, salin seluruhnya
Frontend/src/App.jsx       → timpa file yang lama (sudah ditambahi route /admin/*)
Frontend/.env.example      → salin (isinya cuma alamat backend)
```

> Route publik `/` (halaman utama toko) tidak disentuh sama sekali — hanya
> menambahkan route baru di bawah `/admin`.

## 2. Siapkan backend

Backend belum punya endpoint pendaftaran admin — akun admin **hanya** dibuat lewat
script `create_admin.py`. Dari folder `backend/`:

```bash
cp .env.example .env
```

Isi `backend/.env`:

```
SECRET_KEY=isi-dengan-string-acak-yang-panjang
DATABASE_URL=mysql+pymysql://root:@localhost:3308/rejonik
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password-yang-kuat
ADMIN_WA_NUMBER=6281xxxxxxxxxx
```

Lalu jalankan (butuh MySQL aktif — paling gampang lewat `docker compose up -d db`
di folder `backend/`, sudah tersedia di `docker-compose.yml`):

```bash
pip install -r requirements.txt
alembic upgrade head        # bikin semua tabel
python create_admin.py      # bikin akun admin pertama dari ADMIN_USERNAME/ADMIN_PASSWORD di .env
uvicorn app.main:app --reload
```

Backend akan jalan di `http://localhost:8000`.

## 3. Siapkan frontend

Dari folder `Frontend/`:

```bash
cp .env.example .env    # isinya VITE_API_URL=http://localhost:8000, sesuaikan kalau beda
npm install
npm run dev
```

## 4. Login

Buka `http://localhost:5173/admin/login`, masuk dengan `ADMIN_USERNAME` /
`ADMIN_PASSWORD` yang tadi diisi di `backend/.env`. Setelah masuk, otomatis ke
`/admin` (dashboard). Semua halaman `/admin/*` dilindungi — kalau belum login atau
token kedaluwarsa (berlaku 60 menit, sesuai `ACCESS_TOKEN_EXPIRE_MINUTES` di
`backend/app/security.py`), otomatis dilempar balik ke halaman login.

## 5. Daftar halaman

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
| Pesanan | `/admin/order` | Semua pesanan, filter status, tombol Konfirmasi (isi ongkir) / Tolak |
| Penyesuaian Stok | `/admin/penyesuaian-stok` | Riwayat pengurangan stok (rusak/hilang/dll) + tambah |
| Laporan | `/admin/laporan` | Laporan penjualan (produk terkonfirmasi) + stok menipis/habis |

## Catatan

- Alamat backend dibaca dari `VITE_API_URL` di `Frontend/.env`. Kalau tidak diisi,
  default-nya `http://localhost:8000`.
- Token login disimpan di `localStorage` browser (key `rejonik_admin_token`).
- Sudah dites: `npm run build` dan `npm run lint` di proyek Anda jalan bersih tanpa
  error.
