import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, PackageOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import { peso, formatDate, cn } from '../lib/format.js'
import { ORDER_STATUS_META } from '../lib/constants.js'
import { useOrderHistoryStore } from '../store/orderHistoryStore.js'

export default function TrackOrderPage() {
  const [ref, setRef] = useState('')
  const [live, setLive] = useState(null)
  const navigate = useNavigate()
  const savedOrders = useOrderHistoryStore((s) => s.orders)
  const setStatus = useOrderHistoryStore((s) => s.setStatus)

  useEffect(() => {
    document.title = 'Track Order — SMORS Collection'
  }, [])

  useEffect(() => {
    if (!savedOrders.length) return
    let active = true
    api
      .post('/orders/track', { refs: savedOrders.map((o) => o.ref) })
      .then((res) => {
        if (!active) return
        const byRef = new Map((res.data.orders || []).map((o) => [o.ref, o]))
        setLive(byRef)
        byRef.forEach((info, r) => {
          const saved = savedOrders.find((o) => o.ref === r)
          if (saved && info.status && info.status !== saved.status) setStatus(r, info.status)
        })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [savedOrders.length])

  const submit = (e) => {
    e.preventDefault()
    if (!ref.trim()) return
    navigate(`/order/${ref.trim().toUpperCase()}`)
  }

  return (
    <div className="mx-auto min-h-[80vh] max-w-2xl px-4 pb-24 pt-28 md:px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <p className="field-label">Order lookup</p>
        <h1 className="font-display text-[clamp(2.6rem,8vw,5rem)] uppercase leading-none tracking-wide">
          Track Your <span className="text-stroke">Order</span>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          Enter the reference code from your order confirmation — it looks like
          <span className="mx-1 rounded-md border border-white/12 bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-silver">SMR-XXXXXXX</span>
        </p>
        <form onSubmit={submit} className="mt-8 flex gap-3">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="SMR-XXXXXXX"
            className="input h-14 flex-1 border-white/15 bg-white/[0.04] font-mono text-lg tracking-widest uppercase focus:border-silver/60 focus:outline-none placeholder:text-zinc-700"
            aria-label="Order reference"
          />
          <button type="submit" className="btn-silver shrink-0 !px-7">
            Track <ArrowRight size={15} />
          </button>
        </form>
      </motion.div>

      <MyOrders orders={savedOrders} live={live} onOpen={(r) => navigate(`/order/${r}`)} />
    </div>
  )
}

function MyOrders({ orders, live, onOpen }) {
  if (!orders.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 rounded-2xl border border-dashed border-white/12 p-10 text-center"
      >
        <PackageOpen size={28} className="mx-auto text-zinc-600" />
        <p className="mt-4 font-display text-lg uppercase tracking-wider text-zinc-300">No orders yet</p>
        <p className="mt-1 text-sm text-zinc-500">Orders you place will show up here automatically.</p>
      </motion.div>
    )
  }

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl uppercase tracking-wider">
          My <span className="text-stroke">Orders</span>
        </h2>
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{orders.length} saved</span>
      </div>

      <ul className="mt-5 space-y-3">
        {orders.map((o, i) => {
          const info = live?.get(o.ref)
          const meta = ORDER_STATUS_META[info?.status || o.status] || ORDER_STATUS_META.payment_review
          const total = info?.total ?? o.total
          const placed = info?.placedAt || o.placedAt
          return (
            <motion.li
              key={o.ref}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => onOpen(o.ref)}
                className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all hover:border-silver/50 hover:bg-white/[0.04]"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-semibold tracking-widest text-silver">{o.ref}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">Placed {formatDate(placed)}</p>
                </div>
                <span className="hidden shrink-0 text-sm font-semibold sm:block">{peso(total)}</span>
                <span className={cn('badge shrink-0 border-transparent font-semibold uppercase tracking-wider', meta.tone)}>
                  {meta.label}
                </span>
                <ArrowRight size={15} className="shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-silver" />
              </button>
            </motion.li>
          )
        })}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-zinc-600">
        Saved on this device and synced to your session — clear your browser and your order history comes back when your
        session restores.
      </p>
    </section>
  )
}
