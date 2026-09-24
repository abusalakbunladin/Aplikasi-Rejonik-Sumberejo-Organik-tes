import { cx } from "../utils.js";

// Tabel generik: tinggal kasih daftar kolom + baris data.
// columns: [{ key, label, render?: (row) => node, className? }]
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  emptyText = "Belum ada data.",
  rowKey = "id",
}) {
  const kolomTotal = columns.length;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-quaternary/15 bg-white">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-quaternary/15 bg-tertiary/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cx(
                  "px-4 py-3 font-semibold text-accentThrd whitespace-nowrap",
                  col.className,
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={kolomTotal} className="px-4 py-6 text-center text-quaternary/70">
                Memuat data…
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td colSpan={kolomTotal} className="px-4 py-6 text-center text-red-600">
                {error}
              </td>
            </tr>
          )}

          {!loading && !error && rows.length === 0 && (
            <tr>
              <td colSpan={kolomTotal} className="px-4 py-6 text-center text-quaternary/70">
                {emptyText}
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            rows.map((row, i) => (
              <tr
                key={row[rowKey] ?? i}
                className="border-b border-quaternary/10 last:border-0 hover:bg-tertiary/15"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cx("px-4 py-3 align-top text-accentThrd", col.className)}>
                    {col.render ? col.render(row) : (row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

const GAYA_STATUS = {
  menunggu: "bg-amber-100 text-amber-700",
  dikonfirmasi: "bg-secondary/15 text-secondary",
  ditolak: "bg-red-100 text-red-700",
  lolos: "bg-secondary/15 text-secondary",
  retur: "bg-red-100 text-red-700",
  habis: "bg-red-100 text-red-700",
  rendah: "bg-amber-100 text-amber-700",
};

export function StatusBadge({ value }) {
  const gaya = GAYA_STATUS[value] || "bg-quaternary/10 text-quaternary";
  return (
    <span className={cx("inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize", gaya)}>
      {value}
    </span>
  );
}
