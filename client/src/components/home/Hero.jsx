import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import api from '../../lib/api.js'
import { peso } from '../../lib/format.js'
import { BRAND } from '../../lib/constants.js'
import SmartImage from '../ui/SmartImage.jsx'

const EASE = [0.22, 1, 0.36, 1]

function RevealLine({ children, delay = 0, className = '' }) {
  return (
    <span className="block overflow-hidden leading-[0.88]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: '112%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

const CARD_SLOTS = [
  {
    className: 'right-[6%] top-[14%] w-40 md:w-52 rotate-[6deg]',
    depth: 26,
    floatDelay: '0s',
    enterDelay: 0.6
  },
  {
    className: 'right-[24%] top-[42%] w-44 md:w-56 -rotate-[7deg]',
    depth: 16,
    floatDelay: '1.2s',
    enterDelay: 0.78
  },
  {
    className: 'right-[2%] top-[58%] w-36 md:w-44 rotate-[10deg]',
    depth: 34,
    floatDelay: '2s',
    enterDelay: 0.96
  }
]

export default function Hero() {
  const ref = useRef(null)
  const [products, setProducts] = useState([])
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 50, damping: 16 })
  const sy = useSpring(my, { stiffness: 50, damping: 16 })

  useEffect(() => {
    let live = true
    api
      .get('/products', { params: { limit: 3 } })
      .then((res) => {
        if (!live) return
        setProducts(Array.isArray(res.data.items) ? res.data.items.slice(0, CARD_SLOTS.length) : [])
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative flex min-h-svh items-center overflow-hidden pt-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 78% 38%, rgba(198,198,204,0.09) 0%, transparent 70%), radial-gradient(40% 35% at 12% 82%, rgba(198,198,204,0.05) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 md:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-0">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-zinc-300">
              Polangui, PH
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(3.4rem,11vw,8.5rem)] uppercase">
            <RevealLine delay={0.25}>{BRAND.motto[0]}</RevealLine>
            <RevealLine delay={0.38} className="text-stroke">
              {BRAND.motto[1]}
            </RevealLine>
            <RevealLine delay={0.51} className="bg-gradient-to-b from-[#ececf1] to-[#8f8f98] bg-clip-text text-transparent">
              {BRAND.motto[2]}
            </RevealLine>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
            className="mt-7 max-w-md text-base leading-relaxed text-zinc-400"
          >
            Hand-picked thrifted heat — tees, denim, kicks and outerwear — plus caps & shoe
            restorations by SMORS Customs. One piece at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link to="/shop" className="btn-silver">
              Shop the Drop <ArrowRight size={16} aria-hidden />
            </Link>
            <Link to="/services" className="btn-ghost">
              Restorations
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mt-14 flex gap-8 border-t border-white/8 pt-6 md:gap-12"
          >
            {[
              ['1K+', 'Pieces revived'],
              ['100%', 'Auth checked'],
              ['PH-Wide', 'J&T shipping']
            ].map(([big, small]) => (
              <div key={small}>
                <p className="font-display text-xl tracking-wide text-zinc-100 md:text-2xl">{big}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.25em] text-zinc-500">{small}</p>
              </div>
            ))}
          </motion.div>

          {products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.15, ease: EASE }}
              className="mt-10 lg:hidden"
            >
              <p className="field-label !mb-3">Fresh on the rack</p>
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product.slug}`}
                    className="group w-36 shrink-0 snap-start overflow-hidden rounded-xl border border-white/12 bg-zinc-950"
                  >
                    <SmartImage
                      src={product.images?.[0]}
                      alt={product.name}
                      category={product.category}
                      className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <span className="truncate text-[0.55rem] font-semibold uppercase tracking-widest text-zinc-300">
                        {product.name}
                      </span>
                      <span className="shrink-0 font-display text-xs text-silver">{peso(product.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="relative hidden min-h-[420px] lg:block">
          {products.map((product, i) => (
            <FloatCard key={product._id} product={product} slot={CARD_SLOTS[i]} i={i} sx={sx} sy={sy} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-[0.6rem] mx-auto mb-1 uppercase tracking-[0.4em] text-zinc-600"
        >
          <ArrowDown size={16} className="mx-5 mb-1" aria-hidden />
          Scroll
        </motion.div>
      </motion.div>
    </section>
  )
}

function FloatCard({ product, slot, i, sx, sy }) {
  const x = useTransform(sx, (v) => v * slot.depth)
  const y = useTransform(sy, (v) => v * slot.depth * 0.6)

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: slot.enterDelay + i * 0.05, ease: EASE }}
      className={`absolute ${slot.className}`}
    >
      <Link
        to={`/product/${product.slug}`}
        aria-label={`${product.name} — ${peso(product.price)}`}
        className="group block animate-floaty overflow-hidden rounded-2xl border border-white/12 bg-zinc-950 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] transition-colors hover:border-silver/60"
        style={{ animationDelay: slot.floatDelay }}
      >
        <SmartImage
          src={product.images?.[0]}
          alt=""
          category={product.category}
          className="aspect-square w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <span className="truncate text-[0.6rem] font-semibold uppercase tracking-widest text-zinc-300">
            {product.name}
          </span>
          <span className="shrink-0 font-display text-sm text-silver">{peso(product.price)}</span>
        </div>
      </Link>
    </motion.div>
  )
}
