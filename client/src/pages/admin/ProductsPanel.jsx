import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Package, Plus, SquarePen, Star, Trash2 } from 'lucide-react'
import api from '../../lib/api.js'
import { peso, cn, pageWindow } from '../../lib/format.js'
import SmartImage from '../../components/ui/SmartImage.jsx'
import Loader from '../../components/ui/Loader.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ProductFormModal from './ProductFormModal.jsx'
import { useUiStore } from '../../store/uiStore.js'

const PAGE_SIZE = 10

export default function ProductsPanel({ onChange }) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [state, setState] = useState('loading')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const toast = useUiStore((s) => s.toast)

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = useCallback(() => {
    setState('loading')
    api
      .get('/products', { params: { includeArchived: 'true', limit: PAGE_SIZE, page, q } })
      .then((res) => {
        setData(res.data)
        setState('done')
      })
      .catch(() => setState('error'))
  }, [page, q])

  useEffect(load, [load])

  const goTo = (p) => {
    setPage(Math.min(Math.max(1, p), data.pages))
  }

  const remove = async (p) => {
    if (confirmDelete !== p._id) {
      setConfirmDelete(p._id)
      setTimeout(() => setConfirmDelete((v) => (v === p._id ? null : v)), 3000)
      return
    }
    try {
      await api.delete(`/products/${p._id}`)
      toast(`${p.name} deleted`, 'success')
      if (data.items.length === 1 && page > 1) setPage(page - 1)
      else load()
      onChange?.()
    } catch (err) {
      toast(err.friendly || 'Delete failed', 'error')
    }
    setConfirmDelete(null)
  }

  const toggleFeatured = async (p) => {
    try {
      const res = await api.put(`/products/${p._id}`, { featured: !p.featured })
      setData((prev) => ({
        ...prev,
        items: prev.items.map((x) => (x._id === p._id ? res.data.product : x))
      }))
      onChange?.()
    } catch (err) {
      toast(err.friendly || 'Update failed', 'error')
    }
  }

  if (state === 'loading' && data.items.length === 0)
    return <div className="py-16"><Loader /></div>
  if (state === 'error') return <EmptyState title="Couldn't load products" />

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search listings…"
          className="input h-9 w-full max-w-xs border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none placeholder:text-zinc-600"
        />
        <span className="text-[0.62rem] uppercase tracking-[0.25em] text-zinc-600">
          {data.total} listing{data.total === 1 ? '' : 's'}
        </span>
        <button onClick={() => setCreating(true)} className="btn-silver ml-auto !h-9 !px-5 !text-[0.65rem]">
          <Plus size={14} /> New listing
        </button>
      </div>

      {state === 'loading' && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/40 backdrop-blur-[2px]"><Loader /></div>
      )}

      {data.items.length === 0 ? (
        <EmptyState
          title={q ? 'No matches' : 'No listings'}
          subtitle={q ? `Nothing matches “${q}”.` : 'Add your first piece to get the racks going.'}
        />
      ) : (
        <div className="relative overflow-x-auto rounded-2xl border border-white/8">
          <table className="table min-w-[720px]">
            <thead>
              <tr className="border-white/8 text-[0.58rem] uppercase tracking-[0.22em] text-zinc-500">
                <th className="bg-transparent">Piece</th>
                <th className="bg-transparent">Category</th>
                <th className="bg-transparent">Price</th>
                <th className="bg-transparent">Stock</th>
                <th className="bg-transparent">Status</th>
                <th className="bg-transparent text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p._id} className="border-white/8 transition-colors hover:bg-white/[0.03]">
                  <td>
                    <div className="flex items-center gap-3">
                      <SmartImage src={p.images[0]} alt="" category={p.category} className="h-11 w-11 shrink-0 rounded-lg" />
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
                        <p className="text-[0.62rem] uppercase tracking-wider text-zinc-600">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="capitalize text-sm text-zinc-400">{p.category}</span></td>
                  <td className="font-display tracking-wide">{peso(p.price)}</td>
                  <td>
                    <span className={cn('text-sm font-semibold', p.stock === 0 ? 'text-red-400' : p.stock <= 2 ? 'text-amber-300' : 'text-emerald-300')}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleFeatured(p)}
                      aria-label="Toggle featured"
                      className={cn('grid h-8 w-8 place-items-center rounded-lg transition', p.featured ? 'bg-silver/15 text-silver' : 'text-zinc-700 hover:text-zinc-400')}
                    >
                      <Star size={16} className={p.featured ? 'fill-current' : ''} />
                    </button>
                    {p.status === 'archived' && <span className="ml-2 text-[0.6rem] uppercase tracking-widest text-zinc-600">Archived</span>}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-1.5">
                      <button onClick={() => setEditing(p)} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white">
                        <SquarePen size={15} />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className={cn(
                          'grid h-8 place-items-center rounded-lg transition',
                          confirmDelete === p._id
                            ? 'w-auto bg-red-500 px-3 text-xs font-bold uppercase tracking-wider text-white'
                            : 'w-8 text-zinc-400 hover:bg-red-500/10 hover:text-red-400'
                        )}
                      >
                        {confirmDelete === p._id ? 'Sure?' : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Products pagination">
          <button onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Previous page" className={pagerBtn}>
            <ArrowLeft size={15} />
          </button>
          {pageWindow(page, data.pages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="grid h-9 w-6 place-items-center text-sm text-zinc-600">…</span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p)}
                aria-current={page === p ? 'page' : undefined}
                className={cn(
                  'h-9 min-w-9 rounded-full border border-white/12 px-3 text-sm font-semibold transition',
                  page === p
                    ? 'border-transparent bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black'
                    : 'text-zinc-400 hover:border-silver hover:text-white'
                )}
              >
                {p}
              </button>
            )
          )}
          <button onClick={() => goTo(page + 1)} disabled={page >= data.pages} aria-label="Next page" className={pagerBtn}>
            <ArrowRight size={15} />
          </button>
        </nav>
      )}

      <AnimatePresence>
        {(creating || editing) && (
          <ProductFormModal
            product={editing}
            onClose={() => {
              setCreating(false)
              setEditing(null)
            }}
            onSaved={() => {
              setCreating(false)
              setEditing(null)
              load()
              onChange?.()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const pagerBtn =
  'grid h-9 w-9 place-items-center rounded-full border border-white/12 text-zinc-300 transition hover:border-silver hover:text-white disabled:opacity-30'
