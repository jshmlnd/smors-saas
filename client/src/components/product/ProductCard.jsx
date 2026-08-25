import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SmartImage from '../ui/SmartImage.jsx'
import { Heart, ShoppingBag } from 'lucide-react'
import { peso, cn } from '../../lib/format.js'
import { useCartStore } from '../../store/cartStore.js'
import { useWishlistStore } from '../../store/wishlistStore.js'
import { useUiStore } from '../../store/uiStore.js'

function ProductCard({ product, index = 0 }) {
  const add = useCartStore((s) => s.add)
  const toast = useUiStore((s) => s.toast)
  const wished = useWishlistStore((s) => s.ids.includes(product._id))
  const toggleWish = useWishlistStore((s) => s.toggle)
  const soldOut = product.stock <= 0

  const quickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.sizes?.length > 1) return
    if (soldOut) return
    const size = product.sizes[0] || ''
    add(product, size, 1)
    toast('Added to cart', 'success')
  }

  const wish = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWish(product._id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] transition-colors duration-300 hover:border-white/25"
      >
        <div className="relative aspect-square overflow-hidden">
          <SmartImage
            src={product.images?.[0]}
            alt={product.name}
            category={product.category}
            className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <button
            onClick={wish}
            aria-label="Toggle wishlist"
            className={cn(
              'absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all duration-300',
              wished
                ? 'border-transparent bg-silver text-black opacity-100'
                : 'border-white/20 bg-black/40 text-zinc-300 opacity-0 hover:text-white group-hover:opacity-100'
            )}
          >
            <Heart size={16} className={wished ? 'fill-current' : ''} />
          </button>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.condition && (
              <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-zinc-300 backdrop-blur-md">
                {product.condition}
              </span>
            )}
            {soldOut ? (
              <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white">
                Sold
              </span>
            ) : (
              product.stock === 1 && (
                <span className="rounded-full bg-silver px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-black">
                  Last piece
                </span>
              )
            )}
          </div>

          {!soldOut && (
            <motion.button
              onClick={quickAdd}
              whileTap={{ scale: 0.95 }}
              className="absolute inset-x-3 bottom-3 flex h-10 translate-y-[130%] items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-xs font-semibold uppercase tracking-widest text-black transition-transform duration-300 ease-out group-hover:translate-y-0"
            >
              <ShoppingBag size={14} />
              {product.sizes?.length > 1 ? 'Pick a size' : 'Quick add'}
            </motion.button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              {product.brand}
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.18em] text-zinc-600">{product.category}</span>
          </div>
          <h3 className="line-clamp-2 font-medium leading-snug text-zinc-100">{product.name}</h3>
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className={cn('font-display text-lg tracking-wide', soldOut && 'text-zinc-600 line-through')}>
              {peso(product.price)}
            </span>
            {product.compareAtPrice > product.price && !soldOut && (
              <span className="text-xs text-zinc-500 line-through">{peso(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default memo(ProductCard)
