import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Halaman publik
import Home from "./pages/home.jsx"
import Product from "./pages/product.jsx"
import Advantages from "./pages/advantages.jsx"
import About from "./pages/about.jsx"
import Certificate from "./pages/certificate.jsx"
import Contact from "./pages/contact.jsx"
import Pesan from "./pages/order.jsx"

// Panel admin
import { AuthProvider, ProtectedRoute } from "./admin/authContext.jsx"
import AdminLayout from "./admin/components/adminLayout.jsx"
import Login from "./admin/pages/login.jsx"
import Dashboard from "./admin/pages/dashboard.jsx"
import Kategori from "./admin/pages/kategori.jsx"
import Produk from "./admin/pages/produk.jsx"
import Pemasok from "./admin/pages/pemasok.jsx"
import Penerimaan from "./admin/pages/penerimaan.jsx"
import Penggilingan from "./admin/pages/penggilingan.jsx"
import HasilGiling from "./admin/pages/hasilGiling.jsx"
import Pengemasan from "./admin/pages/pengemasan.jsx"
import Order from "./admin/pages/order.jsx"
import PenyesuaianStok from "./admin/pages/penyesuaianStok.jsx"
import Laporan from "./admin/pages/laporan.jsx"


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produk" element={<Product />} />
          <Route path="/keunggulan" element={<Advantages />} />
          <Route path="/tentang" element={<About />} />
          <Route path="/sertifikat" element={<Certificate />} />
          <Route path="/kontak" element={<Contact />} />
          <Route path="/pesan" element={<Pesan />} />

          <Route path="/admin/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="kategori" element={<Kategori />} />
            <Route path="produk" element={<Produk />} />
            <Route path="pemasok" element={<Pemasok />} />
            <Route path="penerimaan" element={<Penerimaan />} />
            <Route path="penggilingan" element={<Penggilingan />} />
            <Route path="hasil-giling" element={<HasilGiling />} />
            <Route path="pengemasan" element={<Pengemasan />} />
            <Route path="order" element={<Order />} />
            <Route path="penyesuaian-stok" element={<PenyesuaianStok />} />
            <Route path="laporan" element={<Laporan />} />
          </Route>

          {/* Alamat yang tidak dikenal (mis. tautan footer /review, /FAQ, /Help) kembali ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
