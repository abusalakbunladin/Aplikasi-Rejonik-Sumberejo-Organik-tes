import { useEffect, useState } from "react";
import * as api from "../api.js";
import DataTable from "../components/dataTable.jsx";
import { Button, Field, FormPanel, Input, Notice, Select } from "../components/ui.jsx";
import { formatBerat, formatPersen, formatTanggal } from "../utils.js";

export default function Penggilingan() {
  const [rows, setRows] = useState([]);
  const [penerimaanList, setPenerimaanList] = useState([]);
  const [pemasokList, setPemasokList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [penerimaanId, setPenerimaanId] = useState("");
  const [beratMasuk, setBeratMasuk] = useState("");
  const [beratHasil, setBeratHasil] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function muat() {
    setLoading(true);
    setError("");
    try {
      const [penggilingan, penerimaan, pemasok, produk] = await Promise.all([
        api.getPenggilingan(),
        api.getPenerimaan(),
        api.getPemasok(),
        api.getProduk(),
      ]);
      setRows(penggilingan);
      setPenerimaanList(penerimaan);
      setPemasokList(pemasok);
      setProdukList(produk);
    } catch (err) {
      setError(err.message || "Gagal memuat data penggilingan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await muat();
    })();
  }, []);

  function labelPenerimaan(p) {
    const pemasok = pemasokList.find((x) => x.id === p.pemasok_id)?.nama || `Pemasok #${p.pemasok_id}`;
    const produk = produkList.find((x) => x.id === p.produk_id)?.nama || `Produk #${p.produk_id}`;
    return `#${p.id} — ${produk} dari ${pemasok} (sisa ${formatBerat(p.berat_sisa_kg)})`;
  }

  function labelPenerimaanRingkas(id) {
    const p = penerimaanList.find((x) => x.id === id);
    if (!p) return `Penerimaan #${id}`;
    const produk = produkList.find((x) => x.id === p.produk_id)?.nama || `Produk #${p.produk_id}`;
    return `${produk} (#${id})`;
  }

  const penerimaanLolos = penerimaanList.filter((p) => p.status_mutu === "lolos" && p.berat_sisa_kg > 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createPenggilingan({
        penerimaan_id: Number(penerimaanId),
        berat_masuk_kg: Number(beratMasuk),
        berat_hasil_kg: Number(beratHasil),
      });
      setPenerimaanId("");
      setBeratMasuk("");
      setBeratHasil("");
      setFormOpen(false);
      await muat();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan data penggilingan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormPanel title="+ Catat hasil penggilingan" open={formOpen} onToggle={() => setFormOpen((v) => !v)}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Notice type="error">{formError}</Notice>

          <div className="sm:col-span-3">
            <Field label="Bahan baku (yang sudah lolos mutu)">
              <Select value={penerimaanId} onChange={(e) => setPenerimaanId(e.target.value)} required>
                <option value="">Pilih penerimaan bahan baku</option>
                {penerimaanLolos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {labelPenerimaan(p)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Berat masuk digiling (kg)">
            <Input type="number" step="0.01" min="0.01" value={beratMasuk} onChange={(e) => setBeratMasuk(e.target.value)} required />
          </Field>
          <Field label="Berat hasil giling (kg)">
            <Input type="number" step="0.01" min="0.01" value={beratHasil} onChange={(e) => setBeratHasil(e.target.value)} required />
          </Field>

          <div className="flex items-end sm:col-span-1">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </form>
      </FormPanel>

      <DataTable
        loading={loading}
        error={error}
        rows={rows}
        emptyText="Belum ada riwayat penggilingan."
        columns={[
          { key: "tanggal", label: "Tanggal", render: (r) => formatTanggal(r.tanggal) },
          { key: "penerimaan", label: "Bahan baku", render: (r) => labelPenerimaanRingkas(r.penerimaan_id) },
          { key: "berat_masuk_kg", label: "Berat masuk", render: (r) => formatBerat(r.berat_masuk_kg) },
          { key: "berat_hasil_kg", label: "Berat hasil", render: (r) => formatBerat(r.berat_hasil_kg) },
          { key: "susut_kg", label: "Susut", render: (r) => formatBerat(r.susut_kg) },
          { key: "rendemen", label: "Rendemen", render: (r) => formatPersen(r.rendemen) },
        ]}
      />
    </div>
  );
}
