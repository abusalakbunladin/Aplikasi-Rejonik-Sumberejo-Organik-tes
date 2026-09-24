import { useEffect, useState } from "react";
import * as api from "../api.js";
import DataTable, { StatusBadge } from "../components/dataTable.jsx";
import { Button, Field, FormPanel, Input, Notice, Select, Textarea } from "../components/ui.jsx";
import { formatBerat, formatRupiah, formatTanggal } from "../utils.js";

export default function Penerimaan() {
  const [rows, setRows] = useState([]);
  const [pemasokList, setPemasokList] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [pemasokId, setPemasokId] = useState("");
  const [produkId, setProdukId] = useState("");
  const [beratKg, setBeratKg] = useState("");
  const [hargaPerKg, setHargaPerKg] = useState("");
  const [catatan, setCatatan] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function muat() {
    setLoading(true);
    setError("");
    try {
      const [penerimaan, pemasok, produk] = await Promise.all([
        api.getPenerimaan(),
        api.getPemasok(),
        api.getProduk(),
      ]);
      setRows(penerimaan);
      setPemasokList(pemasok);
      setProdukList(produk);
    } catch (err) {
      setError(err.message || "Gagal memuat data penerimaan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await muat();
    })();
  }, []);

  const namaPemasok = (id) => pemasokList.find((p) => p.id === id)?.nama || `Pemasok #${id}`;
  const namaProduk = (id) => produkList.find((p) => p.id === id)?.nama || `Produk #${id}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createPenerimaan({
        pemasok_id: Number(pemasokId),
        produk_id: Number(produkId),
        berat_kg: Number(beratKg),
        harga_per_kg: hargaPerKg ? Number(hargaPerKg) : null,
        catatan: catatan || null,
      });
      setPemasokId("");
      setProdukId("");
      setBeratKg("");
      setHargaPerKg("");
      setCatatan("");
      setFormOpen(false);
      await muat();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan penerimaan.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMutu(id, status_mutu) {
    try {
      await api.updateMutuPenerimaan(id, { status_mutu });
      await muat();
    } catch (err) {
      window.alert(err.message || "Gagal mengubah status mutu.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormPanel title="+ Catat penerimaan bahan baku" open={formOpen} onToggle={() => setFormOpen((v) => !v)}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Notice type="error">{formError}</Notice>

          <Field label="Pemasok">
            <Select value={pemasokId} onChange={(e) => setPemasokId(e.target.value)} required>
              <option value="">Pilih pemasok</option>
              {pemasokList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Produk jadi yang dihasilkan">
            <Select value={produkId} onChange={(e) => setProdukId(e.target.value)} required>
              <option value="">Pilih produk</option>
              {produkList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Berat gabah masuk (kg)">
            <Input type="number" step="0.01" min="0.01" value={beratKg} onChange={(e) => setBeratKg(e.target.value)} required />
          </Field>

          <Field label="Harga beli per kg (opsional)">
            <Input type="number" step="1" min="0" value={hargaPerKg} onChange={(e) => setHargaPerKg(e.target.value)} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Catatan (opsional)">
              <Textarea rows={1} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            </Field>
          </div>

          <div className="sm:col-span-3">
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
        emptyText="Belum ada penerimaan bahan baku."
        columns={[
          { key: "tanggal", label: "Tanggal", render: (r) => formatTanggal(r.tanggal) },
          { key: "pemasok", label: "Pemasok", render: (r) => namaPemasok(r.pemasok_id) },
          { key: "produk", label: "Untuk produk", render: (r) => namaProduk(r.produk_id) },
          { key: "berat_kg", label: "Berat masuk", render: (r) => formatBerat(r.berat_kg) },
          {
            key: "harga_per_kg",
            label: "Harga/kg",
            render: (r) => (r.harga_per_kg != null ? formatRupiah(r.harga_per_kg) : "-"),
          },
          { key: "berat_sisa_kg", label: "Sisa belum digiling", render: (r) => formatBerat(r.berat_sisa_kg) },
          {
            key: "status_mutu",
            label: "Status mutu",
            render: (r) => <StatusBadge value={r.status_mutu} />,
          },
          { key: "catatan", label: "Catatan", render: (r) => r.catatan || "-" },
          {
            key: "aksi",
            label: "",
            render: (r) =>
              r.status_mutu === "menunggu" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMutu(r.id, "lolos")}
                    className="cursor-pointer text-sm font-medium text-secondary hover:underline"
                  >
                    Lolos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMutu(r.id, "retur")}
                    className="cursor-pointer text-sm font-medium text-red-600 hover:underline"
                  >
                    Retur
                  </button>
                </div>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
