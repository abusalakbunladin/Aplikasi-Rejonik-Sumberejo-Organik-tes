import { useEffect, useMemo, useState } from "react";
import * as api from "../api.js";
import DataTable from "../components/dataTable.jsx";
import { Button, Field, FormPanel, Input, Notice, Select } from "../components/ui.jsx";
import { flattenVarian, formatBerat, formatTanggal } from "../utils.js";

export default function Pengemasan() {
  const [rows, setRows] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [varianId, setVarianId] = useState("");
  const [jumlahPcs, setJumlahPcs] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const daftarVarian = useMemo(() => flattenVarian(produkList), [produkList]);

  async function muat() {
    setLoading(true);
    setError("");
    try {
      const [pengemasan, produk] = await Promise.all([api.getPengemasan(), api.getProduk()]);
      setRows(pengemasan);
      setProdukList(produk);
    } catch (err) {
      setError(err.message || "Gagal memuat data pengemasan.");
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
      await api.createPengemasan({ produk_varian_id: Number(varianId), jumlah_pcs: Number(jumlahPcs) });
      setVarianId("");
      setJumlahPcs("");
      setFormOpen(false);
      await muat();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan data pengemasan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormPanel title="+ Catat pengemasan" open={formOpen} onToggle={() => setFormOpen((v) => !v)}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          <Notice type="error">{formError}</Notice>
          <Field label="Produk & varian">
            <Select value={varianId} onChange={(e) => setVarianId(e.target.value)} required>
              <option value="">Pilih varian</option>
              {daftarVarian.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jumlah kemasan (pcs)">
            <Input type="number" step="1" min="1" value={jumlahPcs} onChange={(e) => setJumlahPcs(e.target.value)} required />
          </Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan"}
          </Button>
        </form>
      </FormPanel>

      <p className="text-sm text-quaternary/80">
        Mengemas otomatis menambah stok varian terkait. Beras yang dipakai diambil dari hasil giling yang
        belum dikemas — cek halaman Hasil Giling kalau simpan gagal karena stok gilingan tidak cukup.
      </p>

      <DataTable
        loading={loading}
        error={error}
        rows={rows}
        emptyText="Belum ada riwayat pengemasan."
        columns={[
          { key: "tanggal", label: "Tanggal", render: (r) => formatTanggal(r.tanggal) },
          { key: "varian", label: "Produk & varian", render: (r) => labelVarian(r.produk_varian_id) },
          { key: "jumlah_pcs", label: "Jumlah (pcs)" },
          { key: "berat_terpakai_kg", label: "Berat terpakai", render: (r) => formatBerat(r.berat_terpakai_kg) },
        ]}
      />
    </div>
  );
}
