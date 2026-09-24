import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth.js";
import { cx } from "../utils.js";

const NAV_GROUPS = [
  {
    label: "Ringkasan",
    items: [{ to: "/admin", label: "Dashboard", end: true }],
  },
  {
    label: "Katalog",
    items: [
      { to: "/admin/kategori", label: "Kategori" },
      { to: "/admin/produk", label: "Produk & Varian" },
    ],
  },
  {
    label: "Produksi",
    items: [
      { to: "/admin/pemasok", label: "Pemasok" },
      { to: "/admin/penerimaan", label: "Penerimaan Bahan Baku" },
      { to: "/admin/penggilingan", label: "Penggilingan" },
      { to: "/admin/hasil-giling", label: "Hasil Giling" },
      { to: "/admin/pengemasan", label: "Pengemasan" },
    ],
  },
  {
    label: "Penjualan",
    items: [
      { to: "/admin/order", label: "Pesanan" },
      { to: "/admin/penyesuaian-stok", label: "Penyesuaian Stok" },
    ],
  },
  {
    label: "Laporan",
    items: [{ to: "/admin/laporan", label: "Laporan" }],
  },
];

function judulHalamanAktif(pathname) {
  for (const grup of NAV_GROUPS) {
    for (const item of grup.items) {
      if (item.end ? pathname === item.to : pathname.startsWith(item.to)) {
        return item.label;
      }
    }
  }
  return "Panel Admin";
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-lg font-extrabold text-white">Sumberejo Organik</p>
          <p className="text-sm text-white/60">Panel Admin</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((grup) => (
            <div key={grup.label} className="mb-5">
              <p className="mb-1.5 px-3 text-xs text-white/45">{grup.label}</p>
              <div className="flex flex-col gap-0.5">
                {grup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cx(
                        "rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10",
                        isActive && "bg-white/15 font-semibold text-white",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-quaternary/15 bg-white px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
              className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-lg border border-quaternary/20 lg:hidden"
            >
              <span className="block h-0.5 w-4.5 rounded-full bg-accentThrd" />
              <span className="block h-0.5 w-4.5 rounded-full bg-accentThrd" />
              <span className="block h-0.5 w-4.5 rounded-full bg-accentThrd" />
            </button>
            <h1 className="text-lg font-semibold text-accentThrd">
              {judulHalamanAktif(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <a href="/" className="hidden text-sm text-quaternary hover:text-primary sm:inline">
              Lihat situs
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border border-primary/30 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Keluar
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
