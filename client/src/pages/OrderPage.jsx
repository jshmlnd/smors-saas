import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import { peso, formatDateTime, cn, copyText } from '../lib/format.js'
import { ORDER_TIMELINE, ORDER_STATUS_META, PAYMENT_METHODS, SHIPPING_METHODS } from '../lib/constants.js'
import SmartImage from '../components/ui/SmartImage.jsx'
import { ArrowRight, Check, Copy, Package, Sparkles, Truck } from 'lucide-react'
import Loader from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useUiStore } from '../store/uiStore.js'

export default function OrderPage() {
  const { ref } = useParams()
  const location = useLocation()
  const toast = useUiStore((s) => s.toast)
  const fresh = Boolean(location.state?.fresh)
  const [order, setOrder] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    let live = true
    setState('loading')
    api
      .get(`/orders/ref/${ref}`)
      .then((res) => {
        if (!live) return
        setOrder(res.data.order)
        setState('done')
      })
      .catch(() => live && setState('missing'))
    return () => {
      live = false
    }
  }, [ref])

  if (state === 'loading') return <div className="py-40"><Loader label="PULLING YOUR ORDER" /></div>

  if (state === 'missing') {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 md:px-6">
        <EmptyState
          title="Order not found"
          subtitle={`Nothing matches reference "${ref}". Double-check the code from your confirmation.`}
          action={<Link to="/track" className="btn-silver mt-2">Try again</Link>}
        />
      </div>
    )
  }

  const meta = ORDER_STATUS_META[order.status]
  const timelineIdx = ORDER_TIMELINE.indexOf(order.status)
  const payment = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)
  const shipping = SHIPPING_METHODS.find((m) => m.id === order.shippingMethod)

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 md:px-6 md:pt-36">
      {fresh && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 16 }}
          className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black shadow-[0_0_60px_rgba(198,198,204,0.4)]"
        >
          <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 7" />
          </svg>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fresh ? 0.2 : 0 }}>
        <p className="field-label">{fresh ? "You're in — here's your receipt" : 'Order status'}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
            Order <span className="text-stroke">{order.refCode}</span>
          </h1>
          <button
            onClick={async () => {
              await copyText(order.refCode)
              toast('Reference copied', 'success')
            }}
            aria-label="Copy reference"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-zinc-400 transition hover:border-silver hover:text-white"
          >
            <Copy size={14} />
          </button>
          <span className={cn('badge badge-lg border-transparent font-semibold uppercase tracking-wider', meta.tone)}>
            {meta.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-500">Placed {formatDateTime(order.createdAt)}</p>

        {order.status === 'cancelled' ? (
          <div className="mt-10 rounded-2xl border border-red-400/25 bg-red-500/[0.06] p-6">
            <p className="font-semibold text-red-300">This order was cancelled.</p>
            <p className="mt-1 text-sm text-zinc-400">Stock has been restored. Questions? Message us on Facebook with your reference code.</p>
          </div>
        ) : (
          <Timeline statusIndex={timelineIdx} history={order.statusHistory} className="mt-10" />
        )}

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Panel title="Items">
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li key={`${item.product}-${item.size}`} className="flex items-center gap-3">
                  <SmartImage src={item.image} alt="" category="tees" className="h-14 w-14 shrink-0 rounded-lg" />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      {peso(item.price)} × {item.qty}{item.size ? ` · ${item.size}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{peso(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-1.5 border-t border-dashed border-white/12 pt-4 text-sm">
              <Row label="Subtotal" value={peso(order.subtotal)} />
              <Row label="Shipping" value={order.shippingFee === 0 ? 'FREE' : peso(order.shippingFee)} />
              <Row label="Total paid due" value={peso(order.total)} strong />
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="Deliver to">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-zinc-400">
                {order.customer.address.line}, {order.customer.address.city}, {order.customer.address.province} {order.customer.address.postal}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{order.customer.phone}</p>
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                <Truck size={15} className="shrink-0 text-silver" />
                <span>{shipping?.label} · {shipping?.eta}</span>
              </div>
              {order.shippingMethod === 'jt' && order.trackingNumber && (
                <button
                  onClick={async () => {
                    await copyText(order.trackingNumber)
                    toast('Tracking number copied', 'success')
                  }}
                  className="mt-2 flex w-full items-center gap-2 rounded-lg border border-silver/30 bg-white/[0.05] px-3 py-2 text-xs transition hover:border-silver"
                >
                  <Package size={15} className="shrink-0 text-silver" />
                  <span className="flex-1 text-left text-zinc-400">
                    J&T tracking
                    <span className="ml-2 font-mono font-semibold uppercase tracking-wider text-zinc-100">{order.trackingNumber}</span>
                  </span>
                  <Copy size={13} className="shrink-0 text-zinc-500" aria-hidden />
                </button>
              )}
            </Panel>

            <Panel title={`Payment · ${payment?.label}`}>
              <p className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Status</span>
                <span className="font-semibold">{meta.label}</span>
              </p>
              {order.paymentRefNo && (
                <p className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Ref no.</span>
                  <span className="font-mono">{order.paymentRefNo}</span>
                </p>
              )}
              {order.paymentProofUrl && (
                <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="group mt-3 flex items-center gap-3 rounded-lg border border-white/10 p-2.5 transition hover:border-silver/50">
                  <img src={order.paymentProofUrl} alt="Payment proof" className="h-12 w-12 rounded-md object-cover" />
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-200">
                    View uploaded receipt <ArrowRight size={12} aria-hidden />
                  </span>
                </a>
              )}
            </Panel>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-white/8 p-6">
          <Sparkles size={20} className="text-silver" />
          <p className="flex-1 text-sm text-zinc-400">
            We'll message you status updates via Facebook Messenger.
          </p>
          <a href="https://www.facebook.com/smorscollection" target="_blank" rel="noreferrer" className="btn-ghost h-10 !px-5 !text-[0.65rem]">
            Message us
          </a>
        </div>
      </motion.div>
    </div>
  )
}

function Timeline({ statusIndex, history, className = '' }) {
  return (
    <ol className={cn('space-y-0', className)}>
      {ORDER_TIMELINE.map((status, i) => {
        const reached = i <= statusIndex
        const entry = [...history].reverse().find((h) => h.status === status)
        return (
          <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
            {i < ORDER_TIMELINE.length - 1 && (
              <span className="absolute left-[11px] top-7 h-full w-[2px] overflow-hidden bg-white/10">
                <motion.span
                  className="block h-full bg-gradient-to-b from-[#ececf1] to-[#c6c6cc]"
                  initial={{ height: 0 }}
                  animate={{ height: reached ? '100%' : '0%' }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                />
              </span>
            )}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.08 }}
              className={cn(
                'relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border',
                reached
                  ? 'border-transparent bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black shadow-[0_0_16px_rgba(198,198,204,0.35)]'
                  : 'border-white/15 bg-base-200 text-zinc-600'
              )}
            >
              {reached && <Check size={12} strokeWidth={3} />}
            </motion.span>
            <div className="pt-0.5">
              <p className={cn('text-sm font-semibold uppercase tracking-wider', reached ? 'text-zinc-100' : 'text-zinc-500')}>
                {ORDER_STATUS_META[status].label}
              </p>
              {entry && <p className="mt-0.5 text-xs text-zinc-500">{formatDateTime(entry.at)}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
      <p className="field-label">{title}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-400">{label}</span>
      <span className={strong ? 'font-display text-base tracking-wide text-silver' : 'font-semibold'}>{value}</span>
    </div>
  )
}
