import { useEffect, useState } from "react";
import * as api from "../api.js";
import DataTable from "../components/dataTable.jsx";
import { Button, Field, FormPanel, Input, Notice } from "../components/ui.jsx";

export default function Pemasok() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function muat() {
    setLoading(true);
    setError("");
    try {
      setRows(await api.getPemasok());
    } catch (err) {
      setError(err.message || "Gagal memuat pemasok.");
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
      await api.createPemasok({ nama, kontak });
      setNama("");
      setKontak("");
      setFormOpen(false);
      await muat();
    } catch (err) {
      setFormError(err.message || "Gagal menambah pemasok.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormPanel title="+ Tambah pemasok" open={formOpen} onToggle={() => setFormOpen((v) => !v)}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          <Notice type="error">{formError}</Notice>
          <Field label="Nama pemasok">
            <Input value={nama} onChange={(e) => setNama(e.target.value)} required autoFocus />
          </Field>
          <Field label="Kontak (No. HP)">
            <Input value={kontak} onChange={(e) => setKontak(e.target.value)} required />
          </Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan"}
          </Button>
        </form>
      </FormPanel>

      <DataTable
        loading={loading}
        error={error}
        rows={rows}
        emptyText="Belum ada pemasok."
        columns={[
          { key: "id", label: "#" },
          { key: "nama", label: "Nama" },
          { key: "kontak", label: "Kontak" },
        ]}
      />
    </div>
  );
}
