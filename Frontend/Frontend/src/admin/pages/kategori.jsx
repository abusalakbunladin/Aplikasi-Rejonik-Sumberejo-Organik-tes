import { useEffect, useState } from "react";
import * as api from "../api.js";
import DataTable from "../components/dataTable.jsx";
import { Button, Field, FormPanel, Input, Notice } from "../components/ui.jsx";

export default function Kategori() {
  const [rows, setRows] = useState([]);
  const [jumlahProduk, setJumlahProduk] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function muat() {
    setLoading(true);
    setError("");
    try {
      const [kategori, produk] = await Promise.all([api.getKategori(), api.getProduk()]);
      setRows(kategori);
      const hitung = {};
      for (const p of produk) {
        if (p.kategori_id != null) hitung[p.kategori_id] = (hitung[p.kategori_id] || 0) + 1;
      }
      setJumlahProduk(hitung);
    } catch (err) {
      setError(err.message || "Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await muat();
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createKategori({ nama });
      setNama("");
      setFormOpen(false);
      await muat();
    } catch (err) {
      setFormError(err.message || "Gagal menambah kategori.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHapus(id) {
    if (!window.confirm("Hapus kategori ini?")) return;
    try {
      await api.deleteKategori(id);
      await muat();
    } catch (err) {
      window.alert(err.message || "Gagal menghapus kategori.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormPanel title="+ Tambah kategori" open={formOpen} onToggle={() => setFormOpen((v) => !v)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Notice type="error">{formError}</Notice>
          <div className="flex-1">
            <Field label="Nama kategori">
              <Input value={nama} onChange={(e) => setNama(e.target.value)} required autoFocus />
            </Field>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan"}
          </Button>
        </form>
      </FormPanel>

      <DataTable
        loading={loading}
        error={error}
        rows={rows}
        emptyText="Belum ada kategori."
        columns={[
          { key: "id", label: "#" },
          { key: "nama", label: "Nama" },
          {
            key: "jumlah_produk",
            label: "Jumlah produk",
            render: (r) => jumlahProduk[r.id] || 0,
          },
          {
            key: "aksi",
            label: "",
            render: (r) => (
              <button
                type="button"
                onClick={() => handleHapus(r.id)}
                className="cursor-pointer text-sm font-medium text-red-600 hover:underline"
              >
                Hapus
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
