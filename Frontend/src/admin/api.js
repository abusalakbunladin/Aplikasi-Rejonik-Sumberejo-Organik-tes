// Client API terpusat untuk panel admin.
// Semua request ke backend FastAPI (lihat backend/app/routers/*.py) lewat sini,
// supaya penanganan token & error-nya konsisten di semua halaman.

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const TOKEN_KEY = "rejonik_admin_token";
const LOGOUT_EVENT = "rejonik-admin-logout";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Backend mengembalikan {"detail": "pesan"} untuk error biasa, atau
// {"detail": [{"loc":[...], "msg": "...", ...}, ...]} untuk error validasi (422).
// Fungsi ini menyatukan keduanya jadi satu string pesan yang bisa ditampilkan.
function ekstrakPesanError(payload, fallback) {
  const detail = payload?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => d.msg || JSON.stringify(d))
      .join(", ");
  }
  return fallback;
}

async function request(path, { method = "GET", body, auth = true, isForm = false } = {}) {
  const headers = {};
  let payload = body;

  if (body !== undefined) {
    if (isForm) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      payload = new URLSearchParams(body).toString();
    } else {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new Error(
      `Tidak bisa menghubungi server di ${API_BASE_URL}. Pastikan backend sedang berjalan dan alamatnya benar.`,
    );
  }

  if (res.status === 401 && auth) {
    clearToken();
    window.dispatchEvent(new Event(LOGOUT_EVENT));
  }

  if (res.status === 204) return null;

  const teks = await res.text();
  const data = teks ? JSON.parse(teks) : null;

  if (!res.ok) {
    throw new Error(ekstrakPesanError(data, `Permintaan gagal (status ${res.status})`));
  }
  return data;
}

// ---- Auth ----
export async function login(username, password) {
  const data = await request("/login", {
    method: "POST",
    body: { username, password },
    isForm: true,
    auth: false,
  });
  setToken(data.access_token);
  return data;
}

export function logout() {
  clearToken();
}

export function onUnauthorized(callback) {
  window.addEventListener(LOGOUT_EVENT, callback);
  return () => window.removeEventListener(LOGOUT_EVENT, callback);
}

// ---- Kategori ----
export const getKategori = () => request("/kategori", { auth: false });
export const createKategori = (data) => request("/kategori", { method: "POST", body: data });
export const deleteKategori = (id) => request(`/kategori/${id}`, { method: "DELETE" });

// ---- Produk ----
export const getProduk = (kategoriId) =>
  request(`/produk${kategoriId ? `?kategori_id=${kategoriId}` : ""}`, { auth: false });
export const createProduk = (data) => request("/produk", { method: "POST", body: data });
export const updateProduk = (id, data) => request(`/produk/${id}`, { method: "PUT", body: data });
export const deleteProduk = (id) => request(`/produk/${id}`, { method: "DELETE" });

// ---- Varian produk ----
export const getVarian = (produkId) =>
  request(`/produk-varian${produkId ? `?produk_id=${produkId}` : ""}`, { auth: false });
export const createVarian = (data) => request("/produk-varian", { method: "POST", body: data });
export const updateVarian = (id, data) => request(`/produk-varian/${id}`, { method: "PUT", body: data });
export const deleteVarian = (id) => request(`/produk-varian/${id}`, { method: "DELETE" });

// ---- Pemasok ----
export const getPemasok = () => request("/pemasok");
export const createPemasok = (data) => request("/pemasok", { method: "POST", body: data });

// ---- Produksi: penerimaan bahan baku ----
export const getPenerimaan = () => request("/penerimaan");
export const createPenerimaan = (data) => request("/penerimaan", { method: "POST", body: data });
export const updateMutuPenerimaan = (id, data) =>
  request(`/penerimaan/${id}/mutu`, { method: "PATCH", body: data });

// ---- Produksi: penggilingan ----
export const getPenggilingan = () => request("/penggilingan");
export const createPenggilingan = (data) => request("/penggilingan", { method: "POST", body: data });

// ---- Produksi: hasil giling ----
export const getHasilGiling = () => request("/hasil-giling");

// ---- Produksi: pengemasan ----
export const getPengemasan = () => request("/pengemasan");
export const createPengemasan = (data) => request("/pengemasan", { method: "POST", body: data });

// ---- Order ----
export const getOrders = () => request("/order");
export const confirmOrder = (id, data) => request(`/order/${id}/konfirmasi`, { method: "PATCH", body: data });

// ---- Penyesuaian stok ----
export const getPenyesuaianStok = () => request("/penyesuaian-stok");
export const createPenyesuaianStok = (data) => request("/penyesuaian-stok", { method: "POST", body: data });

// ---- Laporan ----
export const getLaporanPenjualan = () => request("/laporan/penjualan");
export const getLaporanStokRendah = (batas) =>
  request(`/laporan/stok-rendah${batas !== undefined ? `?batas=${batas}` : ""}`);
