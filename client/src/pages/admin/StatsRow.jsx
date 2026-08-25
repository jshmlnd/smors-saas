import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import { peso } from '../../lib/format.js'

function CountUp({ value }) {
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v)
    })
    prev.current = value
    return () => controls.stop()
  }, [value])

  return Math.round(display).toLocaleString()
}

export default function StatsRow({ stats }) {
  const cards = [
    { label: 'Confirmed revenue', value: stats ? peso(stats.revenue) : '—', sub: 'paid & fulfilled orders' },
    { label: 'Total orders', value: stats ? <CountUp value={stats.orderCount} /> : '—', sub: `${stats?.pendingCount ?? 0} in payment review` },
    { label: 'Listings', value: stats ? <CountUp value={stats.productCount} /> : '—', sub: 'active + archived pieces' },
    { label: 'Open requests', value: stats ? <CountUp value={stats.requestCount} /> : '—', sub: 'restos & customs queue' }
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-zinc-500">{c.label}</p>
          <p className="mt-2 font-display text-3xl tracking-wide text-silver-bright">{c.value}</p>
          <p className="mt-1 text-xs text-zinc-600">{c.sub}</p>
        </motion.div>
      ))}
    </div>
  )
}
