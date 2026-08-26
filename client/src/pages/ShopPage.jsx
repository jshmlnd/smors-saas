import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../lib/api.js'
import { CATEGORIES } from '../lib/constants.js'
import ProductCard from '../components/product/ProductCard.jsx'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Loader from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { cn, pageWindow } from '../lib/format.js'

const SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
  { id: 'name-asc', label: 'A–Z' }
]

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [counts, setCounts] = useState({})
  const [state, setState] = useState('loading')

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'newest'
  const page = Number(params.get('page')) || 1

  const query = useMemo(
    () => ({ q, category, sort, page, limit: 10 }),
    [q, category, sort, page]
  )

  useEffect(() => {
    let live = true
    setState('loading')
    api
      .get('/products', { params: query })
      .then((res) => {
        if (!live) return
        setData(res.data)
        setState('done')
        window.scrollTo({ top: 0 })
      })
      .catch(() => live && setState('error'))
    return () => {
      live = false
    }
  }, [query])

  useEffect(() => {
    api
      .get('/products/meta/categories')
      .then((res) => setCounts(Object.fromEntries(res.data.counts.map((c) => [c._id, c.count]))))
      .catch(() => {})
  }, [])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (!value || value === '') next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setParams(next, { preventScrollReset: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-6 md:pt-36">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <p className="field-label !mb-1">{q ? `Results for “${q}”` : 'The full rack'}</p>
        <h1 className="font-display text-[clamp(2.6rem,7vw,5rem)] uppercase leading-none tracking-wide">
          {category ? CATEGORIES.find((c) => c.id === category)?.label : (
            <>
              Shop <span className="text-stroke">All</span>
            </>
          )}
        </h1>
      </motion.div>

      <div className="sticky top-14 z-30 -mx-4 mb-10 border-y border-white/8 bg-base-100/90 px-4 py-3 backdrop-blur-xl md:top-16 md:-mx-6 md:px-6">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => update('category', '')}
              className={cn('chip', !category && 'chip-active')}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => update('category', c.id)}
                className={cn('chip', category === c.id && 'chip-active')}
              >
                {c.label}
                {counts[c.id] != null && <span className="opacity-60">{counts[c.id]}</span>}
              </button>
            ))}
          </div>

          <label className="relative flex shrink-0 items-center self-end sm:self-auto">
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value === 'newest' ? '' : e.target.value)}
              className="select select-sm h-9 rounded-full border-white/15 bg-zinc-900 text-xs uppercase tracking-wider focus:border-silver/50 focus:outline-none"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {state === 'loading' && (
        <div className="py-20">
          <Loader label="PICKING PIECES" />
        </div>
      )}

      {state === 'error' && (
        <EmptyState
          title="Rack jammed"
          subtitle="We couldn't load the catalog. Check your connection and retry."
        />
      )}

      {state === 'done' && data && data.items.length === 0 && (
        <EmptyState
          title="Nothing here yet"
          subtitle={
            q
              ? `No pieces match “${q}”. Try a different keyword or clear the filters.`
              : 'This category is being restocked — check the other racks.'
          }
          action={
            <button onClick={() => setParams({})} className="btn-ghost mt-2 h-10 !text-[0.68rem]">
              Clear filters
            </button>
          }
        />
      )}

      {state === 'done' && data && data.items.length > 0 && (
        <>
          <p className="mb-6 text-xs uppercase tracking-[0.25em] text-zinc-500">
            {data.total} piece{data.total === 1 ? '' : 's'}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {data.items.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {data.pages > 1 && (
            <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
              <button
                onClick={() => update('page', String(page - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className={pagerBtn}
              >
                <ArrowLeft size={16} />
              </button>
              {pageWindow(page, data.pages).map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="grid h-10 w-6 place-items-center text-sm text-zinc-600">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => update('page', String(p))}
                    aria-current={page === p ? 'page' : undefined}
                    className={cn(
                      'h-10 min-w-10 rounded-full border border-white/12 px-3 text-sm font-semibold transition',
                      page === p
                        ? 'border-transparent bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black'
                        : 'text-zinc-400 hover:border-silver hover:text-white'
                    )}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => update('page', String(page + 1))}
                disabled={page >= data.pages}
                aria-label="Next page"
                className={pagerBtn}
              >
                <ArrowRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

const pagerBtn =
  'grid h-10 w-10 place-items-center rounded-full border border-white/12 text-zinc-300 transition hover:border-silver hover:text-white disabled:opacity-30'
