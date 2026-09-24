import { useEffect, useState } from "react";
import * as api from "../api.js";
import { Button, Field, FormPanel, Input, Notice, Select } from "../components/ui.jsx";
import { formatBerat, formatRupiah } from "../utils.js";

export default function Produk() {
  const [produkList, setProdukList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formProdukOpen, setFormProdukOpen] = useState(false);
  const [namaProduk, setNamaProduk] = useState("");
  const [kategoriIdProduk, setKategoriIdProduk] = useState("");
  const [errorProduk, setErrorProduk] = useState("");
  const [submitProduk, setSubmitProduk] = useState(false);

  const [formVarianOpen, setFormVarianOpen] = useState(false);
  const [varianProdukId, setVarianProdukId] = useState("");
  const [berat, setBerat] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("0");
  const [errorVarian, setErrorVarian] = useState("");
  const [submitVarian, setSubmitVarian] = useState(false);

  async function muat() {
    setLoading(true);
    setError("");
    try {
      const [produk, kategori] = await Promise.all([api.getProduk(), api.getKategori()]);
      setProdukList(produk);
      setKategoriList(kategori);
    } catch (err) {
      setError(err.message || "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await muat();
    })();
  }, []);

  function namaKategori(id) {
    return kategoriList.find((k) => k.id === id)?.nama || "Tanpa kategori";
  }

  async function handleSubmitProduk(e) {
    e.preventDefault();
    setErrorProduk("");
    setSubmitProduk(true);
    try {
      await api.createProduk({
        nama: namaProduk,
        kategori_id: kategoriIdProduk ? Number(kategoriIdProduk) : null,
      });
      setNamaProduk("");
      setKategoriIdProduk("");
      setFormProdukOpen(false);
      await muat();
    } catch (err) {
      setErrorProduk(err.message || "Gagal menambah produk.");
    } finally {
      setSubmitProduk(false);
    }
  }

  async function handleSubmitVarian(e) {
    e.preventDefault();
    setErrorVarian("");
    if (!varianProdukId) {
      setErrorVarian("Pilih produk dulu.");
      return;
    }
    setSubmitVarian(true);
    try {
      await api.createVarian({
        produk_id: Number(varianProdukId),
        berat: Number(berat),
        harga: Number(harga),
        stok: Number(stok || 0),
      });
      setBerat("");
      setHarga("");
      setStok("0");
      setFormVarianOpen(false);
      await muat();
    } catch (err) {
      setErrorVarian(err.message || "Gagal menambah varian.");
    } finally {
      setSubmitVarian(false);
    }
  }

  async function handleHapusProduk(id) {
    if (!window.confirm("Hapus produk ini beserta datanya?")) return;
    try {
      await api.deleteProduk(id);
      await muat();
    } catch (err) {
      window.alert(err.message || "Gagal menghapus produk.");
    }
  }

  async function handleHapusVarian(id) {
    if (!window.confirm("Hapus varian ini?")) return;
    try {
      await api.deleteVarian(id);
      await muat();
    } catch (err) {
      window.alert(err.message || "Gagal menghapus varian.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormPanel
        title="+ Tambah produk"
        open={formProdukOpen}
        onToggle={() => setFormProdukOpen((v) => !v)}
      >
        <form onSubmit={handleSubmitProduk} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          <Notice type="error">{errorProduk}</Notice>
          <Field label="Nama produk">
            <Input value={namaProduk} onChange={(e) => setNamaProduk(e.target.value)} required autoFocus />
          </Field>
          <Field label="Kategori">
            <Select value={kategoriIdProduk} onChange={(e) => setKategoriIdProduk(e.target.value)}>
              <option value="">Tanpa kategori</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </Select>
          </Field>
          <Button type="submit" disabled={submitProduk}>
            {submitProduk ? "Menyimpan…" : "Simpan produk"}
          </Button>
        </form>
      </FormPanel>

      <FormPanel
        title="+ Tambah varian (berat/harga/stok)"
        open={formVarianOpen}
        onToggle={() => setFormVarianOpen((v) => !v)}
      >
        <form onSubmit={handleSubmitVarian} className="grid grid-cols-1 gap-4 sm:grid-cols-5 sm:items-end">
          <Notice type="error">{errorVarian}</Notice>
          <Field label="Produk">
            <Select value={varianProdukId} onChange={(e) => setVarianProdukId(e.target.value)} required>
              <option value="">Pilih produk</option>
              {produkList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Berat (kg)">
            <Input type="number" step="0.01" min="0.01" value={berat} onChange={(e) => setBerat(e.target.value)} required />
          </Field>
          <Field label="Harga (Rp)">
            <Input type="number" step="1" min="1" value={harga} onChange={(e) => setHarga(e.target.value)} required />
          </Field>
          <Field label="Stok awal">
            <Input type="number" step="1" min="0" value={stok} onChange={(e) => setStok(e.target.value)} />
          </Field>
          <Button type="submit" disabled={submitVarian}>
            {submitVarian ? "Menyimpan…" : "Simpan varian"}
          </Button>
        </form>
      </FormPanel>

      {loading && <p className="text-sm text-quaternary/70">Memuat data…</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && produkList.length === 0 && (
        <p className="text-sm text-quaternary/70">Belum ada produk.</p>
      )}

      {!loading &&
        !error &&
        produkList.map((p) => (
          <div key={p.id} className="rounded-lg border border-quaternary/15 bg-white">
            <div className="flex items-center justify-between border-b border-quaternary/15 px-4 py-3">
              <div>
                <p className="font-semibold text-accentThrd">{p.nama}</p>
                <p className="text-xs text-quaternary">{namaKategori(p.kategori_id)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleHapusProduk(p.id)}
                className="cursor-pointer text-sm font-medium text-red-600 hover:underline"
              >
                Hapus produk
              </button>
            </div>

            {p.varian.length === 0 ? (
              <p className="px-4 py-3 text-sm text-quaternary/70">Belum ada varian untuk produk ini.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-tertiary/20 text-accentThrd">
                    <th className="px-4 py-2 font-semibold">Berat</th>
                    <th className="px-4 py-2 font-semibold">Harga</th>
                    <th className="px-4 py-2 font-semibold">Stok</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {p.varian.map((v) => (
                    <tr key={v.id} className="border-t border-quaternary/10">
                      <td className="px-4 py-2 text-accentThrd">{formatBerat(v.berat)}</td>
                      <td className="px-4 py-2 text-accentThrd">{formatRupiah(v.harga)}</td>
                      <td className="px-4 py-2 text-accentThrd">{v.stok}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleHapusVarian(v.id)}
                          className="cursor-pointer text-sm font-medium text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
    </div>
  );
}
