import { useEffect, useMemo, useState } from "react";
import * as api from "../api.js";
import DataTable from "../components/dataTable.jsx";
import { Button, Field, FormPanel, Input, Notice, Select } from "../components/ui.jsx";
import { flattenVarian, formatTanggal } from "../utils.js";

export default function PenyesuaianStok() {
  const [rows, setRows] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [varianId, setVarianId] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [alasan, setAlasan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const daftarVarian = useMemo(() => flattenVarian(produkList), [produkList]);

  async function muat() {
    setLoading(true);
    setError("");
    try {
      const [penyesuaian, produk] = await Promise.all([api.getPenyesuaianStok(), api.getProduk()]);
      setRows(penyesuaian);
      setProdukList(produk);
    } catch (err) {
      setError(err.message || "Gagal memuat penyesuaian stok.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await muat();
    })();
  }, []);

  function labelVarian(id) {
    return daftarVarian.find((v) => v.id === id)?.label || `Varian #${id}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createPenyesuaianStok({
        produk_varian_id: Number(varianId),
        jumlah: Number(jumlah),
        alasan,
        keterangan: keterangan || null,
      });
      setVarianId("");
      setJumlah("");
      setAlasan("");
      setKeterangan("");
      setFormOpen(false);
      await muat();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan penyesuaian stok.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormPanel title="+ Kurangi stok (rusak/hilang/dll)" open={formOpen} onToggle={() => setFormOpen((v) => !v)}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Notice type="error">{formError}</Notice>

          <Field label="Produk & varian">
            <Select value={varianId} onChange={(e) => setVarianId(e.target.value)} required>
              <option value="">Pilih varian</option>
              {daftarVarian.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} — stok {v.stok}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jumlah dikurangi">
            <Input type="number" step="1" min="1" value={jumlah} onChange={(e) => setJumlah(e.target.value)} required />
          </Field>
          <Field label="Alasan">
            <Input
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="misal: rusak, expired, hilang"
              required
            />
          </Field>
          <Field label="Keterangan (opsional)">
            <Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </Field>

          <div className="sm:col-span-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </form>
      </FormPanel>

      <DataTable
        loading={loading}
        error={error}
        rows={rows}
        emptyText="Belum ada penyesuaian stok."
        columns={[
          { key: "tanggal", label: "Tanggal", render: (r) => formatTanggal(r.tanggal) },
          { key: "varian", label: "Produk & varian", render: (r) => labelVarian(r.produk_varian_id) },
          { key: "jumlah", label: "Jumlah dikurangi" },
          { key: "alasan", label: "Alasan", render: (r) => <span className="capitalize">{r.alasan}</span> },
          { key: "keterangan", label: "Keterangan", render: (r) => r.keterangan || "-" },
        ]}
      />
    </div>
  );
}
