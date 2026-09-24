// Kumpulan helper format yang dipakai di seluruh halaman admin.

export function formatRupiah(angka) {
  const n = Number(angka ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatKg(angka) {
  const n = Number(angka ?? 0);
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} kg`;
}

export function formatBerat(angka) {
  const n = Number(angka ?? 0);
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} kg`;
}

export function formatTanggal(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatPersen(angka) {
  const n = Number(angka ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(n);
}

// Meratakan daftar produk (yang masing-masing punya array `varian`) jadi satu
// daftar varian datar, ditambahi info produk induknya. Dipakai di halaman-halaman
// yang butuh dropdown/lookup varian (Pengemasan, Penyesuaian Stok, Order, dst).
export function flattenVarian(daftarProduk) {
  const hasil = [];
  for (const produk of daftarProduk ?? []) {
    for (const v of produk.varian ?? []) {
      hasil.push({
        ...v,
        nama_produk: produk.nama,
        label: `${produk.nama} — ${formatBerat(v.berat)}`,
      });
    }
  }
  return hasil;
}

export function cx(...kelas) {
  return kelas.filter(Boolean).join(" ");
}
