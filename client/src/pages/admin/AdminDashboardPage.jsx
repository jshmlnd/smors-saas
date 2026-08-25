import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../lib/api.js'
import { useAuthStore } from '../../store/authStore.js'
import { ShieldCheck } from 'lucide-react'
import OrdersPanel from './OrdersPanel.jsx'
import ProductsPanel from './ProductsPanel.jsx'
import RequestsPanel from './RequestsPanel.jsx'
import StatsRow from './StatsRow.jsx'

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
  { id: 'requests', label: 'Requests' }
]

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('orders')
  const logout = useAuthStore((s) => s.logout)

  const [stats, setStats] = useState(null)
  const refreshStats = useCallback(() => {
    Promise.all([api.get('/orders'), api.get('/products', { params: { includeArchived: 'true', limit: 1 } }), api.get('/service-requests')])
      .then(([o, p, r]) => {
        const orders = o.data.orders
        const paid = ['confirmed', 'shipped', 'delivered']
        setStats({
          revenue: orders.filter((x) => paid.includes(x.status)).reduce((n, x) => n + x.total, 0),
          orderCount: orders.length,
          pendingCount: orders.filter((x) => x.status === 'payment_review').length,
          productCount: p.data.total,
          requestCount: r.data.requests.filter((x) => !['completed', 'declined'].includes(x.status)).length
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/admin" className="flex items-baseline gap-1">
            <span className="font-display text-xl tracking-widest">SMORS</span>
            <span className="text-[0.55rem] font-bold uppercase tracking-[0.3em] text-silver">Back office</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="btn-ghost h-9 !px-4 !text-[0.62rem]">
              View site
            </a>
            <button onClick={logout} className="btn-ghost h-9 !px-4 !text-[0.62rem] hover:!border-red-400/40 hover:!text-red-300">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <StatsRow stats={stats} />

        <div className="mt-10 flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 sm:w-fit">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="relative rounded-full px-5 py-2">
              {tab === t.id && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-[#ececf1] to-[#c6c6cc]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative text-xs font-semibold uppercase tracking-widest ${tab === t.id ? 'text-black' : 'text-zinc-400'}`}>
                {t.label}
                {t.id === 'orders' && stats?.pendingCount > 0 && (
                  <span className="ml-1.5 opacity-70">·{stats.pendingCount}</span>
                )}
                {t.id === 'requests' && stats?.requestCount > 0 && (
                  <span className="ml-1.5 opacity-70">·{stats.requestCount}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8"
        >
          {tab === 'orders' && <OrdersPanel onChange={refreshStats} />}
          {tab === 'products' && <ProductsPanel onChange={refreshStats} />}
          {tab === 'requests' && <RequestsPanel onChange={refreshStats} />}
        </motion.div>

        <p className="mt-16 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-zinc-700">
          <ShieldCheck size={13} /> Hustle · Lifestyle · Balance
        </p>
      </main>
    </div>
  )
}
