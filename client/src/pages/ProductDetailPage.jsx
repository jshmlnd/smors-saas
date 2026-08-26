import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../lib/api.js'
import { peso, cn } from '../lib/format.js'
import { PAYMENT_METHODS } from '../lib/constants.js'
import SmartImage from '../components/ui/SmartImage.jsx'
import QuantityStepper from '../components/ui/QuantityStepper.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
import { ChevronDown, Heart, ShieldCheck, ShoppingBag } from 'lucide-react'
import Loader from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useCartStore } from '../store/cartStore.js'
import { useWishlistStore } from '../store/wishlistStore.js'
import { useUiStore } from '../store/uiStore.js'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [state, setState] = useState('loading')
  const [imgIndex, setImgIndex] = useState(0)
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [related, setRelated] = useState([])

  const add = useCartStore((s) => s.add)
  const toast = useUiStore((s) => s.toast)
  const wished = useWishlistStore((s) => (product ? s.ids.includes(product._id) : false))
  const toggleWish = useWishlistStore((s) => s.toggle)

  useEffect(() => {
    let live = true
    setState('loading')
    setProduct(null)
    setImgIndex(0)
    setSize('')
    setQty(1)
    api
      .get(`/products/slug/${slug}`)
      .then(async (res) => {
        if (!live) return
        setProduct(res.data.product)
        setSize(res.data.product.sizes[0] || '')
        setState('done')
        try {
          const rel = await api.get('/products', {
            params: {
              category: res.data.product.category,
              limit: 5
            }
          })
          if (live) {
            setRelated(rel.data.items.filter((p) => p._id !== res.data.product._id).slice(0, 4))
          }
        } catch {
          /* related is optional */
        }
      })
      .catch(() => live && setState('missing'))
    return () => {
      live = false
    }
  }, [slug])

  useEffect(() => {
    if (state === 'done' && product) document.title = `${product.name} — SMORS`
    return () => {
      document.title = 'SMORS — Thrifted & Pre-Loved Essentials'
    }
  }, [product, state])

  const images = product?.images?.length ? product.images : [null]
  const soldOut = product ? product.stock <= 0 : false

  const handleAdd = () => {
    add(product, size, qty)
    toast('Added to cart', 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-28 md:px-6 md:pt-36 lg:pb-24">
      {state === 'loading' && (
        <div className="py-32">
          <Loader label="PULLING IT OFF THE RACK" />
        </div>
      )}

      {state === 'missing' && (
        <EmptyState
          title="Piece not found"
          subtitle="It may have been sold or archived. The racks update fast."
          action={
            <Link to="/shop" className="btn-silver mt-2">
              Back to shop
            </Link>
          }
        />
      )}

      {state === 'done' && product && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <nav className="mb-8 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500">
            <Link to="/shop" className="transition-colors hover:text-zinc-200">Shop</Link>
            <span>/</span>
            <Link to={`/shop?category=${product.category}`} className="capitalize transition-colors hover:text-zinc-200">
              {product.category}
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={imgIndex}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="h-full w-full"
                  >
                    <SmartImage
                      src={images[imgIndex]}
                      alt={product.name}
                      category={product.category}
                      className="h-full w-full"
                    />
                  </motion.div>
                </AnimatePresence>
                {soldOut && (
                  <span className="absolute left-4 top-4 rounded-full bg-red-500/90 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em]">
                    Sold
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-3">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      aria-label={`View image ${i + 1}`}
                      className={cn(
                        'aspect-square w-20 overflow-hidden rounded-xl border transition',
                        i === imgIndex ? 'border-silver' : 'border-white/10 opacity-60 hover:opacity-100'
                      )}
                    >
                      <SmartImage src={src} alt="" className="h-full w-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  {product.condition}
                </span>
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  {product.brand}
                </span>
              </div>

              <h1 className="mt-4 font-display text-[clamp(1.9rem,4vw,3rem)] uppercase leading-tight tracking-wide">
                {product.name}
              </h1>

              <div className="mt-5 flex items-baseline gap-3">
                <span className={cn('font-display text-3xl tracking-wide', soldOut && 'text-zinc-600')}>
                  {peso(product.price)}
                </span>
                {product.compareAtPrice > product.price && !soldOut && (
                  <>
                    <span className="text-base text-zinc-500 line-through">{peso(product.compareAtPrice)}</span>
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <p className="mt-6 max-w-lg leading-relaxed text-zinc-400">{product.description}</p>

              {product.sizes.length > 0 && (
                <div className="mt-8">
                  <p className="field-label">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        disabled={soldOut}
                        className={cn(
                          'h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold uppercase transition-all',
                          size === s
                            ? 'border-transparent bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black'
                            : 'border-white/15 text-zinc-300 hover:border-silver hover:text-white'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {!soldOut && (
                  <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
                )}
                <span
                  className={cn(
                    'text-[0.65rem] uppercase tracking-[0.22em]',
                    soldOut ? 'text-red-400' : product.stock <= 2 ? 'text-amber-300' : 'text-emerald-300'
                  )}
                >
                  {soldOut ? 'Sold out' : `${product.stock} in stock`}
                </span>
              </div>

              <div className="mt-7 hidden gap-3 lg:flex">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={soldOut}
                  className="btn-silver flex-1"
                >
                  <ShoppingBag size={17} /> {soldOut ? 'Sold Out' : 'Add to Cart'}
                </motion.button>
                <button
                  onClick={() => toggleWish(product._id)}
                  aria-label="Toggle wishlist"
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-all',
                    wished
                      ? 'border-transparent bg-silver text-black'
                      : 'border-white/15 text-zinc-300 hover:border-silver hover:text-white'
                  )}
                >
                  <Heart size={20} className={wished ? 'fill-current' : ''} />
                </button>
              </div>

              <div className="mt-10 space-y-px overflow-hidden rounded-2xl border border-white/8">
                {[
                  {
                    title: 'Shipping & Payments',
                    body: `Ships nationwide via J&T Express (₱150) or door-to-door within Metro Manila (₱120). Free shipping on orders over ₱3,500. Pay via GCash, BDO or BPI — upload your proof at checkout.`
                  },
                  {
                    title: 'Condition Guide',
                    body:
                      'Thrifted = honest wear with plenty of life left · Pre-loved = gently used, minor signs of age · Like-new = worn once or twice, near mint.'
                  },
                  ...(product.tags?.length
                    ? [{ title: 'Tags', body: product.tags.map((t) => `#${t}`).join('  ') }]
                    : [])
                ].map((row) => (
                  <details key={row.title} className="group border-b border-white/8 last:border-0 open:bg-white/[0.02]">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold uppercase tracking-wider text-zinc-200 [&::-webkit-details-marker]:hidden">
                      {row.title}
                      <ChevronDown size={16} className="text-zinc-500 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">{row.body}</p>
                  </details>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck size={15} className="text-silver" />
                Payments verified within hours — questions? DM us on Facebook.
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-24">
              <h2 className="mb-8 font-display text-3xl uppercase tracking-wide">
                More <span className="text-stroke">{product.category}</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                {related.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-20 rounded-2xl border border-white/8 p-6 md:p-8">
            <p className="field-label">Accepted payments</p>
            <div className="flex flex-wrap gap-3 pt-1">
              {PAYMENT_METHODS.map((m) => (
                <span key={m.id} className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200">
                  {m.label}
                </span>
              ))}
            </div>
          </section>
        </motion.div>
      )}

      {state === 'done' && product && (
        <div className="action-bar lg:hidden">
          <div className="min-w-0">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              {soldOut ? 'Price' : 'Total'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cn('font-display text-xl tracking-wide', soldOut && 'text-zinc-600 line-through')}>
                {peso(product.price)}
              </span>
              {product.compareAtPrice > product.price && !soldOut && (
                <span className="text-xs text-zinc-500 line-through">{peso(product.compareAtPrice)}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => toggleWish(product._id)}
            aria-label="Toggle wishlist"
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all',
              wished ? 'border-transparent bg-silver text-black' : 'border-white/15 text-zinc-300'
            )}
          >
            <Heart size={19} className={wished ? 'fill-current' : ''} />
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            disabled={soldOut}
            className="btn-silver h-12 flex-1 !px-4"
          >
            <ShoppingBag size={17} /> {soldOut ? 'Sold Out' : 'Add to Cart'}
          </motion.button>
        </div>
      )}
    </div>
  )
}
