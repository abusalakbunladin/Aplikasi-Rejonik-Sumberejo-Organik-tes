import { useEffect, useState } from "react";
import * as api from "../api.js";
import DataTable from "../components/dataTable.jsx";
import { formatBerat } from "../utils.js";

export default function HasilGiling() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let batal = false;
    api
      .getHasilGiling()
      .then((data) => !batal && setRows(data))
      .catch((err) => !batal && setError(err.message || "Gagal memuat hasil giling."))
      .finally(() => !batal && setLoading(false));
    return () => {
      batal = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-quaternary/80">
        Rekap beras hasil giling per produk yang belum sepenuhnya dikemas.
      </p>
      <DataTable
        loading={loading}
        error={error}
        rows={rows}
        rowKey="produk_id"
        emptyText="Belum ada hasil giling."
        columns={[
          { key: "nama_produk", label: "Produk" },
          { key: "total_digiling_kg", label: "Total digiling", render: (r) => formatBerat(r.total_digiling_kg) },
          { key: "sudah_dikemas_kg", label: "Sudah dikemas", render: (r) => formatBerat(r.sudah_dikemas_kg) },
          { key: "sisa_kg", label: "Sisa belum dikemas", render: (r) => formatBerat(r.sisa_kg) },
        ]}
      />
    </div>
  );
}
