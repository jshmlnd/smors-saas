import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SmartImage from '../components/ui/SmartImage.jsx'
import QuantityStepper from '../components/ui/QuantityStepper.jsx'
import { ArrowRight, Check, Trash2 } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState.jsx'
import { peso } from '../lib/format.js'
import { useCartStore } from '../store/cartStore.js'
import { useUiStore } from '../store/uiStore.js'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const toast = useUiStore((s) => s.toast)

  const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0)
  const freeAt = 3500
  const progress = Math.min(100, (subtotal / freeAt) * 100)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 md:px-6 md:pt-40">
        <h1 className="mb-10 font-display text-4xl uppercase tracking-wide md:text-5xl">
          Your <span className="text-stroke">Cart</span>
        </h1>
        <EmptyState
          title="Cart's empty"
          subtitle="The racks are full though. Go find your next grail."
          action={
            <Link to="/shop" className="btn-silver mt-2">
              Shop the drop
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-6 md:pt-36">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 font-display text-4xl uppercase tracking-wide md:text-5xl"
      >
        Your <span className="text-stroke">Cart</span>{' '}
        <span className="align-top text-base text-zinc-500">({items.length})</span>
      </motion.h1>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
                className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-3.5"
              >
                <Link to={`/product/${item.slug}`} className="shrink-0 overflow-hidden rounded-xl">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 md:h-28 md:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        {item.brand}
                        {item.size ? ` · Size ${item.size}` : ''}
                      </p>
                      <Link to={`/product/${item.slug}`} className="mt-0.5 line-clamp-1 font-medium text-zinc-100 hover:text-white">
                        {item.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        remove(item.key)
                        toast('Removed from cart')
                      }}
                      aria-label={`Remove ${item.name}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    <QuantityStepper
                      small
                      value={item.qty}
                      onChange={(q) => setQty(item.key, q)}
                      max={item.stock}
                    />
                    <span className="font-display text-lg tracking-wide">{peso(item.price * item.qty)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-xl uppercase tracking-wider">Summary</h2>

          <div className="rounded-xl border border-white/8 p-4">
            {subtotal >= freeAt ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <Check size={15} /> Free shipping unlocked
              </p>
            ) : (
              <>
                <p className="text-xs text-zinc-400">
                  Add <span className="font-bold text-silver">{peso(freeAt - subtotal)}</span> more for free J&T shipping
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#9a9aa3] to-[#ececf1]"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between border-t border-dashed border-white/12 pt-4 text-sm text-zinc-400">
            <span>Subtotal</span>
            <span className="font-semibold text-zinc-100">{peso(subtotal)}</span>
          </div>
          <p className="-mt-2 text-xs text-zinc-600">Shipping calculated at checkout.</p>

          <Link to="/checkout" className="btn-silver w-full">
            Checkout <ArrowRight size={15} />
          </Link>
          <Link to="/shop" className="btn-ghost w-full !border-transparent !text-[0.68rem] hover:!bg-white/[0.04]">
            Keep thrifting
          </Link>
        </aside>
      </div>
    </div>
  )
}
