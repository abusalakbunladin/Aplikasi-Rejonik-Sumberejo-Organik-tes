import { useEffect, useMemo, useState } from "react";
import * as api from "../api.js";
import { StatusBadge } from "../components/dataTable.jsx";
import { Button, Input } from "../components/ui.jsx";
import { flattenVarian, formatRupiah, formatTanggal } from "../utils.js";

function alamatLengkap(o) {
  return [o.nama_jalan, o.detail_lainnya, o.kecamatan, o.kota, o.provinsi, o.kode_pos]
    .filter(Boolean)
    .join(", ");
}

function KartuOrder({ order, labelVarian, onUbah }) {
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [ongkir, setOngkir] = useState("0");
  const [memproses, setMemproses] = useState(false);
  const [error, setError] = useState("");

  async function konfirmasi() {
    setMemproses(true);
    setError("");
    try {
      await onUbah(order.id, { status_konfirmasi: "dikonfirmasi", ongkir: Number(ongkir || 0) });
    } catch (err) {
      setError(err.message || "Gagal mengonfirmasi pesanan.");
    } finally {
      setMemproses(false);
    }
  }

  async function tolak() {
    if (!window.confirm(`Tolak pesanan #${order.id}? Stok yang dipesan akan dikembalikan.`)) return;
    setMemproses(true);
    setError("");
    try {
      await onUbah(order.id, { status_konfirmasi: "ditolak", ongkir: 0 });
    } catch (err) {
      setError(err.message || "Gagal menolak pesanan.");
    } finally {
      setMemproses(false);
    }
  }

  return (
    <div className="rounded-lg border border-quaternary/15 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-quaternary/15 px-4 py-3">
        <div>
          <p className="font-semibold text-accentThrd">
            #{order.id} — {order.nama_pembeli}
          </p>
          <p className="text-xs text-quaternary">{formatTanggal(order.tanggal)}</p>
        </div>
        <StatusBadge value={order.status_konfirmasi} />
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 py-3 sm:grid-cols-2">
        <div className="text-sm text-accentThrd">
          <p className="mb-1 text-quaternary">No. HP: {order.no_telepon || "-"}</p>
          <p className="text-quaternary">Alamat: {alamatLengkap(order) || "-"}</p>
        </div>

        <div className="text-sm">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-accentThrd">
              <span>
                {labelVarian(it.produk_varian_id)} × {it.jumlah}
              </span>
              <span>{formatRupiah(it.harga_saat_itu * it.jumlah)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-quaternary/10 pt-2 text-accentThrd">
            <span>Subtotal produk</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
          <div className="flex justify-between text-accentThrd">
            <span>Ongkos kirim</span>
            <span>{formatRupiah(order.ongkir)}</span>
          </div>
          <div className="flex justify-between font-semibold text-primary">
            <span>Total</span>
            <span>{formatRupiah(order.total + order.ongkir)}</span>
          </div>
        </div>
      </div>

      {order.status_konfirmasi === "menunggu" && (
        <div className="border-t border-quaternary/15 px-4 py-3">
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          {showKonfirmasi ? (
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-accentThrd">Ongkos kirim (Rp)</span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={ongkir}
                  onChange={(e) => setOngkir(e.target.value)}
                  className="w-40"
                />
              </label>
              <Button onClick={konfirmasi} disabled={memproses}>
                {memproses ? "Memproses…" : "Simpan konfirmasi"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => setShowKonfirmasi(false)}>
                Batal
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button onClick={() => setShowKonfirmasi(true)} disabled={memproses}>
                Konfirmasi pesanan
              </Button>
              <Button variant="danger" onClick={tolak} disabled={memproses}>
                Tolak
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Order() {
  const [rows, setRows] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("semua");

  const daftarVarian = useMemo(() => flattenVarian(produkList), [produkList]);
  const labelVarian = (id) => daftarVarian.find((v) => v.id === id)?.label || `Varian #${id}`;

  async function muat() {
    setLoading(true);
    setError("");
    try {
      const [orders, produk] = await Promise.all([api.getOrders(), api.getProduk()]);
      setRows(orders);
      setProdukList(produk);
    } catch (err) {
      setError(err.message || "Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await muat();
    })();
  }, []);

  async function handleUbahStatus(id, data) {
    await api.confirmOrder(id, data);
    await muat();
  }

  const rowsTampil = filter === "semua" ? rows : rows.filter((r) => r.status_konfirmasi === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {[
          { key: "semua", label: "Semua" },
          { key: "menunggu", label: "Menunggu" },
          { key: "dikonfirmasi", label: "Dikonfirmasi" },
          { key: "ditolak", label: "Ditolak" },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === f.key ? "bg-primary text-white" : "bg-white text-accentThrd border border-quaternary/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-quaternary/70">Memuat pesanan…</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && rowsTampil.length === 0 && (
        <p className="text-sm text-quaternary/70">Tidak ada pesanan untuk filter ini.</p>
      )}

      {!loading &&
        !error &&
        rowsTampil.map((o) => (
          <KartuOrder key={o.id} order={o} labelVarian={labelVarian} onUbah={handleUbahStatus} />
        ))}
    </div>
  );
}
