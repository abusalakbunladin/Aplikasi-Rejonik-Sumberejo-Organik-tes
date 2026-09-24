import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api.js";
import DataTable, { StatusBadge } from "../components/dataTable.jsx";
import { formatRupiah, formatTanggal } from "../utils.js";

function KartuStat({ label, value, to }) {
  const isi = (
    <div className="rounded-lg border border-quaternary/15 bg-white p-5">
      <p className="text-sm text-quaternary">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
  return to ? (
    <Link to={to} className="block transition hover:-translate-y-0.5">
      {isi}
    </Link>
  ) : (
    isi
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ringkasan, setRingkasan] = useState(null);
  const [pesananTerbaru, setPesananTerbaru] = useState([]);

  useEffect(() => {
    let batal = false;
    async function muat() {
      setLoading(true);
      setError("");
      try {
        const [produk, orders, stokRendah, penjualan] = await Promise.all([
          api.getProduk(),
          api.getOrders(),
          api.getLaporanStokRendah(),
          api.getLaporanPenjualan(),
        ]);
        if (batal) return;

        const jumlahVarian = produk.reduce((total, p) => total + (p.varian?.length || 0), 0);
        const menunggu = orders.filter((o) => o.status_konfirmasi === "menunggu").length;
        const totalPendapatan = penjualan.reduce((t, x) => t + x.total_pendapatan, 0);

        setRingkasan({
          totalProduk: produk.length,
          jumlahVarian,
          menunggu,
          stokRendah: stokRendah.length,
          totalPendapatan,
        });
        setPesananTerbaru(orders.slice(0, 5));
      } catch (err) {
        if (!batal) setError(err.message || "Gagal memuat ringkasan.");
      } finally {
        if (!batal) setLoading(false);
      }
    }
    muat();
    return () => {
      batal = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KartuStat
          label="Total produk"
          value={loading ? "…" : `${ringkasan.totalProduk} produk / ${ringkasan.jumlahVarian} varian`}
          to="/admin/produk"
        />
        <KartuStat
          label="Pesanan menunggu konfirmasi"
          value={loading ? "…" : ringkasan.menunggu}
          to="/admin/order"
        />
        <KartuStat
          label="Varian stok menipis/habis"
          value={loading ? "…" : ringkasan.stokRendah}
          to="/admin/laporan"
        />
        <KartuStat
          label="Pendapatan (pesanan terkonfirmasi)"
          value={loading ? "…" : formatRupiah(ringkasan.totalPendapatan)}
          to="/admin/laporan"
        />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-accentThrd">Pesanan terbaru</h2>
        <DataTable
          loading={loading}
          error={error}
          rows={pesananTerbaru}
          emptyText="Belum ada pesanan masuk."
          columns={[
            { key: "id", label: "#", render: (r) => `#${r.id}` },
            { key: "nama_pembeli", label: "Pembeli" },
            { key: "tanggal", label: "Tanggal", render: (r) => formatTanggal(r.tanggal) },
            { key: "total", label: "Total", render: (r) => formatRupiah(r.total) },
            {
              key: "status_konfirmasi",
              label: "Status",
              render: (r) => <StatusBadge value={r.status_konfirmasi} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
