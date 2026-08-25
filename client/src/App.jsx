import { Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Loader from './components/ui/Loader.jsx'
import Toaster from './components/ui/Toaster.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import TrackOrderPage from './pages/TrackOrderPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import { useAuthStore } from './store/authStore.js'
import { initSessionSync } from './lib/sessionSync.js'

const EASE = [0.22, 1, 0.36, 1]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function RequireAdmin({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    initSessionSync()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Toaster />

      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Navbar />
        </motion.div>
      )}

      <main className={`relative flex-1 ${isAdmin ? '' : 'min-h-[70vh]'}`}>
        <Suspense fallback={<div className="py-40"><Loader /></div>}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 30, scale: 0.997, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{
                opacity: 0,
                y: -14,
                scale: 0.994,
                filter: 'blur(6px)',
                transition: { duration: 0.22, ease: [0.4, 0, 1, 1] }
              }}
              transition={{ duration: 0.55, ease: EASE }}
              style={{ willChange: 'transform, opacity, filter' }}
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/:ref" element={<OrderPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin/*"
                  element={
                    <RequireAdmin>
                      <AdminDashboardPage />
                    </RequireAdmin>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Footer />
        </motion.div>
      )}
    </div>
  )
}
