import { useCallback, useEffect, useMemo, useState } from "react";
import * as api from "../api.js";
import { StatusBadge } from "../components/dataTable.jsx";
import { Button, Input } from "../components/ui.jsx";
import { flattenVarian, formatRupiah, formatTanggal } from "../utils.js";

const TAB = [
  ["menunggu", "Menunggu"],
  ["dikonfirmasi", "Dikonfirmasi"],
  ["ditolak", "Ditolak"],
  ["semua", "Semua"],
];
const alamat = (o) => [o.nama_jalan, o.kecamatan, o.kota, o.provinsi, o.kode_pos].filter(Boolean).join(", ");
const nomorWa = (n) => (n || "").replace(/\D/g, "").replace(/^0/, "62");

function KartuOrder({ order, labelVarian, onUbah }) {
  const kirim = order.metode === "kirim";
  const [ongkir, setOngkir] = useState("");
  const [proses, setProses] = useState(false);
  const [error, setError] = useState("");
  const total = order.total + order.ongkir;
  const pesan =
    `Halo ${order.nama_pembeli}, terkait pesanan #${order.id} di Sumberejo Organik.` +
    (order.status_konfirmasi === "dikonfirmasi" ? ` Total pembayaran ${formatRupiah(total)}.` : "");

  async function ubah(status) {
    if (status === "ditolak" && !window.confirm(`Tolak pesanan #${order.id}? Stok yang dipesan akan dikembalikan.`)) return;
    setProses(true);
    setError("");
    try {
      await onUbah(order.id, { status_konfirmasi: status, ongkir: status === "dikonfirmasi" && kirim ? Number(ongkir) : 0 });
    } catch (err) {
      setError(err.message || "Gagal memperbarui pesanan.");
    } finally {
      setProses(false);
    }
  }

  return (
    <div className="rounded-lg border border-quaternary/15 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-quaternary/15 px-4 py-3">
        <div>
          <p className="font-semibold text-accentThrd">#{order.id} — {order.nama_pembeli}</p>
          <p className="text-xs text-quaternary">{formatTanggal(order.tanggal)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-tertiary/60 px-2.5 py-1 text-xs font-medium text-accentThrd">
            {kirim ? "Dikirim" : "Ambil sendiri"}
          </span>
          <StatusBadge value={order.status_konfirmasi} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 py-3 sm:grid-cols-2">
        <div className="text-sm text-quaternary">
          <p className="mb-1">No. WhatsApp: {order.no_telepon || "-"}</p>
          {kirim ? (
            <>
              <p>Alamat: {alamat(order) || "-"}</p>
              {order.detail_lainnya && <p className="mt-1">Petunjuk lokasi: {order.detail_lainnya}</p>}
            </>
          ) : (
            <p>Diambil sendiri oleh pembeli, tanpa ongkos kirim.</p>
          )}
        </div>
        <div className="text-sm text-accentThrd">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between gap-3">
              <span>{labelVarian(it.produk_varian_id)} × {it.jumlah}</span>
              <span>{formatRupiah(it.harga_saat_itu * it.jumlah)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-quaternary/10 pt-2">
            <span>Subtotal produk</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
          {kirim && (
            <div className="flex justify-between">
              <span>Ongkos kirim</span>
              <span>{order.status_konfirmasi === "dikonfirmasi" ? formatRupiah(order.ongkir) : "Belum dihitung"}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-primary">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-quaternary/15 px-4 py-3">
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
        {order.status_konfirmasi === "menunggu" && (
          <>
            {kirim && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-accentThrd">Ongkos kirim (Rp)</span>
                <Input type="number" min="0" step="1" value={ongkir} onChange={(e) => setOngkir(e.target.value)} className="w-40" />
              </label>
            )}
            <Button onClick={() => ubah("dikonfirmasi")} disabled={proses || (kirim && ongkir === "")}>
              {proses ? "Memproses…" : "Konfirmasi pesanan"}
            </Button>
            <Button variant="danger" onClick={() => ubah("ditolak")} disabled={proses}>Tolak</Button>
          </>
        )}
        <a
          href={`https://wa.me/${nomorWa(order.no_telepon)}?text=${encodeURIComponent(pesan)}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Chat pembeli
        </a>
      </div>
    </div>
  );
}

export default function Order() {
  const [rows, setRows] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("menunggu");

  const daftarVarian = useMemo(() => flattenVarian(produkList), [produkList]);
  const labelVarian = (id) => daftarVarian.find((v) => v.id === id)?.label || `Varian #${id}`;

  // Pemuatan pertama menampilkan "Memuat…"; refresh otomatis berikutnya berjalan diam-diam.
  const muat = useCallback(async () => {
    try {
      const [orders, produk] = await Promise.all([api.getOrders(), api.getProduk()]);
      setRows([...orders].sort((a, b) => b.id - a.id));
      setProdukList(produk);
      setError("");
    } catch (err) {
      setError(err.message || "Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await muat();
    })();
    const t = setInterval(muat, 15000);
    return () => clearInterval(t);
  }, [muat]);

  const jumlah = (k) => (k === "semua" ? rows.length : rows.filter((r) => r.status_konfirmasi === k).length);
  const tampil = filter === "semua" ? rows : rows.filter((r) => r.status_konfirmasi === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {TAB.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === k ? "bg-primary text-white" : "border border-quaternary/20 bg-white text-accentThrd"
            }`}
          >
            {label} ({jumlah(k)})
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-quaternary/70">Memuat pesanan…</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && tampil.length === 0 && (
        <p className="text-sm text-quaternary/70">Belum ada pesanan di tab ini.</p>
      )}
      {!loading && tampil.map((o) => (
        <KartuOrder
          key={o.id}
          order={o}
          labelVarian={labelVarian}
          onUbah={async (id, data) => {
            await api.confirmOrder(id, data);
            await muat();
          }}
        />
      ))}
    </div>
  );
}
