# Catatan Penggabungan

Repo ini adalah gabungan tiga versi kode yang berjalan terpisah:

| Versi | Isi uniknya |
|---|---|
| `Aplikasi-Rejonik-Sumberejo-Organik--main` (MAIN) | Halaman publik terbaru (termasuk halaman `/kontak` lengkap), navbar dengan warna teks untuk halaman berlatar terang, validasi backend yang lebih ketat (batas panjang/angka, kode pos 5 digit, respons error 422 seragam), pembulatan berat, `selectinload` (kurangi query berulang), cek varian kembar / varian yang sudah terpakai, `CORS_ORIGINS`, tes Playwright |
| `ayam-main` (AYAM) | Pemesanan dengan metode **kirim / ambil sendiri**, halaman `/pesan` + pelacakan status (`GET /order/lacak/{id}`), pesan WhatsApp yang lebih rinci, migrasi `c3a1e5d7b9f2` |
| `Aplikasi-Rejonik-Sumberejo-Organik-tes-main` (TES) | Panel admin lengkap (`Frontend/src/admin`, rute `/admin/*`) dan panduannya |

Dasar hasil gabungan adalah MAIN; bagian unik AYAM dan TES ditambahkan di atasnya.

## Konflik dan keputusannya

| File | Masalah | Keputusan |
|---|---|---|
| `backend/app/routers/order.py` | Tiga versi berbeda | Pakai versi AYAM (superset). MAIN tidak punya perubahan unik di file ini |
| `backend/app/schemas.py` | MAIN mewajibkan alamat lengkap, AYAM membuatnya opsional untuk `ambil` | Digabung: alamat opsional, **wajib jika `kirim`**; batas panjang MAIN dan validasi kode pos 5 digit tetap berlaku (bila diisi); `metode` ditambahkan di `OrderCreate` dan `OrderResponse` |
| `backend/app/models.py` | MAIN punya pembulatan, AYAM punya kolom `metode` | Keduanya dipakai |
| `Frontend/.../order-section.jsx` | MAIN mengganti tombol jadi "Situs Resmi" → `/` (karena belum ada halaman pesan); AYAM "Pesan di Situs" → `/pesan` | Pakai AYAM, karena halaman `/pesan` sekarang ada |
| `Frontend/.../navbar.jsx` | Tombol "Login Admin" mengarah ke `/` | Diarahkan ke `/admin/login` (desktop dan mobile) |
| `Frontend/src/App.jsx` | Tiap versi hanya punya sebagian rute | Semua rute publik + `/pesan` + `/admin/*`; ditambah rute `*` yang mengarahkan alamat tak dikenal ke beranda |
| `Frontend/src/pages/admin.jsx` (AYAM) | Memakai rute `/admin`, bentrok dengan panel TES | Dihapus. Halaman Pesanan di panel TES sudah mencakup fungsi yang sama (metode kirim/ambil, ongkir hanya untuk kirim, chat WhatsApp, filter, auto-refresh 15 detik) |

Ketergantungan yang menentukan keputusan: `order.jsx` dan halaman admin Pesanan (TES) memakai `metode` dan
endpoint `/order/lacak`, yang hanya ada di backend AYAM. Backend versi TES sendiri tidak punya keduanya,
jadi backend gabungan wajib memuat perubahan AYAM.

## Yang sengaja tidak dibawa

- Halaman publik versi TES yang lebih lama (`home`, `product`, `footer`, `advantages`, `navbar` dengan tautan `/review`, `index.css`), karena MAIN/AYAM memiliki versi yang lebih baru dan lengkap.
- Backend versi TES yang lebih lama (tanpa penguncian baris `with_for_update` yang dimiliki MAIN dan AYAM, `deps.py` tanpa cek user, schema gaya lama, `requirements.txt` tanpa versi, `docker-compose` tanpa password database).
- Folder ganda `Frontend/Frontend/` di zip TES dan salinan kedua `PANDUAN-ADMIN.md`.
- Aset `public/sertificate/` (ejaan lama; halaman terbaru memakai `public/certificate/`) dan versi TES untuk `advantages/Organik.svg` dan `Terjangkau.svg` (nama filenya tertukar).

## Perlu diketahui

- Jalankan `alembic upgrade head` setelah memakai versi ini: menambahkan kolom `orders.metode` (order lama dianggap `kirim`). Rantai migrasi linear dengan satu head (`c3a1e5d7b9f2`).
- Tautan footer `/review`, `/FAQ`, dan `/Help` sudah ada sejak MAIN/AYAM dan memang belum punya halaman; sekarang jatuh ke beranda, bukan layar kosong.
- Halaman `/pesan` menampilkan gambar produk lewat nama produk (`/product/<nama>.png`); kalau nama produk di database tidak cocok dengan nama file di `Frontend/public/product/`, gambarnya otomatis disembunyikan (bukan error).

## Pemeriksaan yang sudah dilakukan

- Frontend: seluruh 41 modul (halaman publik, `/pesan`, panel admin) berhasil di-bundle dengan esbuild tanpa error atau peringatan; tidak ada identifier yang tak terdefinisi; semua tautan internal baru menuju rute yang ada; semua aset yang dirujuk ada.
- Backend: seluruh file Python terkompilasi; 87 impor antar-modul valid; kolom model, schema, dan router untuk `Order` konsisten; rantai Alembic linear.
- Kontrak API: semua endpoint yang dipanggil frontend (panel admin, `/pesan`, `/login`) ada di backend dengan method yang sama.

Belum bisa dijalankan di lingkungan penggabungan (tidak ada FastAPI/MySQL dan tidak ada akses jaringan untuk
`npm install`): menjalankan backend terhadap database sungguhan, `npm run build`, `npm run lint`, dan tes
Playwright. Sebelum dipakai, jalankan tiga hal itu, lalu coba alur pesan → konfirmasi di admin sekali secara
manual (kirim dan ambil sendiri).
