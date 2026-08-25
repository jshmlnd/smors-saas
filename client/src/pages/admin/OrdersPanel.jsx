import { Fragment, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../../lib/api.js'
import { peso, formatDateTime, cn } from '../../lib/format.js'
import { ORDER_STATUS_META, PAYMENT_METHODS, SHIPPING_METHODS } from '../../lib/constants.js'
import SmartImage from '../../components/ui/SmartImage.jsx'
import { ExternalLink } from 'lucide-react'
import Loader from '../../components/ui/Loader.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { useUiStore } from '../../store/uiStore.js'

const STATUSES = Object.keys(ORDER_STATUS_META)

export default function OrdersPanel({ onChange }) {
  const [orders, setOrders] = useState([])
  const [state, setState] = useState('loading')
  const [filter, setFilter] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const toast = useUiStore((s) => s.toast)

  const load = () => {
    setState('loading')
    api
      .get('/orders')
      .then((res) => {
        setOrders(res.data.orders)
        setState('done')
      })
      .catch(() => setState('error'))
  }

  useEffect(load, [])

  const visible = useMemo(() => {
    let list = orders
    if (filter) list = list.filter((o) => o.status === filter)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      list = list.filter(
        (o) =>
          o.refCode.toLowerCase().includes(needle) ||
          o.customer.name.toLowerCase().includes(needle) ||
          o.customer.phone.includes(needle)
      )
    }
    return list
  }, [orders, filter, q])

  const setStatus = async (order, status) => {
    setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status } : o)))
    try {
      await api.put(`/orders/${order._id}/status`, { status })
      toast(`${order.refCode} → ${ORDER_STATUS_META[status].label}`, 'success')
      onChange?.()
    } catch (err) {
      toast(err.friendly || 'Update failed', 'error')
      load()
    }
  }

  if (state === 'loading') return <div className="py-16"><Loader /></div>
  if (state === 'error')
    return <EmptyState title="Couldn't load orders" subtitle="Is the API running and MongoDB connected?" />

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ref / name / mobile…"
          className="input h-9 w-full max-w-xs border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none placeholder:text-zinc-600"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setFilter('')} className={cn('chip h-8', !filter && 'chip-active')}>
            All
          </button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn('chip h-8', filter === s && 'chip-active')}>
              {ORDER_STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No orders here" subtitle="New orders land in this queue the moment they're placed." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="table">
            <thead>
              <tr className="border-white/8 text-[0.58rem] uppercase tracking-[0.22em] text-zinc-500">
                <th className="bg-transparent">Order</th>
                <th className="hidden bg-transparent md:table-cell">Customer</th>
                <th className="bg-transparent">Total</th>
                <th className="hidden bg-transparent lg:table-cell">Payment</th>
                <th className="hidden bg-transparent xl:table-cell">Shipping</th>
                <th className="bg-transparent">Status</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {visible.map((o) => {
                  const meta = ORDER_STATUS_META[o.status]
                  return (
                    <Fragment key={o._id}>
                      <motion.tr
                        layout
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(open === o._id ? null : o._id)}
                        className="cursor-pointer border-white/8 hover:bg-white/[0.03]"
                      >
                        <td className="whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-silver">{o.refCode}</span>
                          <p className="mt-0.5 text-[0.62rem] text-zinc-600">{formatDateTime(o.createdAt)}</p>
                          <p className="md:hidden text-[0.62rem] text-zinc-400">{o.customer.name}</p>
                        </td>
                        <td className="hidden whitespace-nowrap md:table-cell">
                          <span className="text-sm">{o.customer.name}</span>
                          <p className="text-[0.65rem] text-zinc-500">{o.customer.phone}</p>
                        </td>
                        <td className="font-display text-base tracking-wide">{peso(o.total)}</td>
                        <td className="hidden lg:table-cell">
                          <span className="capitalize text-sm">{PAYMENT_METHODS.find((m) => m.id === o.paymentMethod)?.label}</span>
                          {o.paymentProofUrl && (
                            <a
                              href={o.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 inline-flex align-middle text-zinc-500 transition hover:text-silver"
                              aria-label="View proof"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </td>
                        <td className="hidden whitespace-nowrap xl:table-cell">
                          <span className="text-sm capitalize">{SHIPPING_METHODS.find((m) => m.id === o.shippingMethod)?.label.split(' ')[0]}</span>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => setStatus(o, e.target.value)}
                            className={cn('select select-sm h-8 min-h-0 w-36 rounded-lg border bg-black/60 text-[0.68rem] font-semibold uppercase tracking-wider focus:outline-none', toneClass(meta.tone))}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_META[s].label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </motion.tr>
                      {open === o._id && (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-white/8 bg-black/40">
                          <td colSpan={6} className="p-5">
                            <div className="grid gap-6 md:grid-cols-3">
                              <div>
                                <p className="field-label">Ship to</p>
                                <p className="text-sm">{o.customer.name}</p>
                                <p className="text-sm text-zinc-400">
                                  {o.customer.address.line}, {o.customer.address.city}, {o.customer.address.province} {o.customer.address.postal}
                                </p>
                                {o.customer.messenger && <p className="mt-1 text-xs text-zinc-500">FB: {o.customer.messenger}</p>}
                                {o.notes && <p className="mt-2 rounded-lg border border-white/10 p-2 text-xs italic text-zinc-400">“{o.notes}”</p>}
                              </div>
                              <div>
                                <p className="field-label">Items</p>
                                <ul className="space-y-2">
                                  {o.items.map((i) => (
                                    <li key={`${i.product}-${i.size}`} className="flex items-center gap-2.5">
                                      <SmartImage src={i.image} alt="" className="h-9 w-9 rounded-md" />
                                      <span className="flex-1 text-xs">{i.name} ×{i.qty}{i.size ? ` · ${i.size}` : ''}</span>
                                      <span className="text-xs font-semibold">{peso(i.price * i.qty)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="field-label">Breakdown</p>
                                <p className="text-sm text-zinc-300">Subtotal {peso(o.subtotal)}</p>
                                <p className="text-sm text-zinc-300">Shipping {o.shippingFee === 0 ? 'FREE' : peso(o.shippingFee)}</p>
                                <p className="mt-1 font-display text-lg tracking-wide text-silver">{peso(o.total)}</p>
                                {o.paymentRefNo && <p className="mt-2 text-xs text-zinc-500">Pay ref: {o.paymentRefNo}</p>}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </Fragment>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function toneClass(tone) {
  if (tone.includes('warning')) return 'border-amber-400/40 text-amber-200'
  if (tone.includes('info')) return 'border-sky-400/40 text-sky-200'
  if (tone.includes('success')) return 'border-emerald-400/40 text-emerald-200'
  if (tone.includes('error')) return 'border-red-400/40 text-red-200'
  return 'border-silver/40 text-zinc-100'
}
