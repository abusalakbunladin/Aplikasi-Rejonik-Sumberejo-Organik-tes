import { useEffect, useState } from "react";
import * as api from "../api.js";
import DataTable, { StatusBadge } from "../components/dataTable.jsx";
import { Button, Input } from "../components/ui.jsx";
import { formatBerat, formatRupiah } from "../utils.js";

export default function Laporan() {
  const [penjualan, setPenjualan] = useState([]);
  const [loadingPenjualan, setLoadingPenjualan] = useState(true);
  const [errorPenjualan, setErrorPenjualan] = useState("");

  const [batas, setBatas] = useState(5);
  const [batasInput, setBatasInput] = useState("5");
  const [stokRendah, setStokRendah] = useState([]);
  const [loadingStok, setLoadingStok] = useState(true);
  const [errorStok, setErrorStok] = useState("");

  useEffect(() => {
    let batal = false;
    async function muat() {
      setLoadingPenjualan(true);
      try {
        const data = await api.getLaporanPenjualan();
        if (!batal) setPenjualan(data);
      } catch (err) {
        if (!batal) setErrorPenjualan(err.message || "Gagal memuat laporan penjualan.");
      } finally {
        if (!batal) setLoadingPenjualan(false);
      }
    }
    muat();
    return () => {
      batal = true;
    };
  }, []);

  useEffect(() => {
    let batal = false;
    async function muat() {
      setLoadingStok(true);
      try {
        const data = await api.getLaporanStokRendah(batas);
        if (!batal) setStokRendah(data);
      } catch (err) {
        if (!batal) setErrorStok(err.message || "Gagal memuat laporan stok rendah.");
      } finally {
        if (!batal) setLoadingStok(false);
      }
    }
    muat();
    return () => {
      batal = true;
    };
  }, [batas]);

  const totalPendapatan = penjualan.reduce((t, x) => t + x.total_pendapatan, 0);
  const totalTerjual = penjualan.reduce((t, x) => t + x.total_terjual, 0);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-1 text-base font-semibold text-accentThrd">Laporan penjualan</h2>
        <p className="mb-3 text-sm text-quaternary/80">
          Dihitung dari pesanan yang berstatus dikonfirmasi.
        </p>
        <DataTable
          loading={loadingPenjualan}
          error={errorPenjualan}
          rows={penjualan}
          rowKey="produk_varian_id"
          emptyText="Belum ada penjualan terkonfirmasi."
          columns={[
            { key: "nama_produk", label: "Produk" },
            { key: "berat", label: "Varian", render: (r) => formatBerat(r.berat) },
            { key: "total_terjual", label: "Terjual (pcs)" },
            { key: "total_pendapatan", label: "Pendapatan", render: (r) => formatRupiah(r.total_pendapatan) },
          ]}
        />
        {!loadingPenjualan && !errorPenjualan && penjualan.length > 0 && (
          <div className="mt-2 flex justify-end gap-8 pr-4 text-sm font-semibold text-primary">
            <span>Total terjual: {totalTerjual} pcs</span>
            <span>Total pendapatan: {formatRupiah(totalPendapatan)}</span>
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-accentThrd">Stok menipis / habis</h2>
            <p className="text-sm text-quaternary/80">Varian dengan stok di bawah atau sama dengan batas.</p>
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setBatas(Number(batasInput || 0));
            }}
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-accentThrd">Batas stok</span>
              <Input
                type="number"
                min="0"
                step="1"
                value={batasInput}
                onChange={(e) => setBatasInput(e.target.value)}
                className="w-28"
              />
            </label>
            <Button type="submit" variant="ghost">
              Terapkan
            </Button>
          </form>
        </div>

        <DataTable
          loading={loadingStok}
          error={errorStok}
          rows={stokRendah}
          emptyText="Tidak ada varian dengan stok rendah."
          columns={[
            { key: "nama", label: "Produk" },
            { key: "berat", label: "Varian", render: (r) => formatBerat(r.berat) },
            { key: "stok", label: "Sisa stok" },
            { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
          ]}
        />
      </section>
    </div>
  );
}
