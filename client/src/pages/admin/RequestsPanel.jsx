import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../../lib/api.js'
import { formatDate, cn } from '../../lib/format.js'
import { REQUEST_STATUS_META } from '../../lib/constants.js'
import { ExternalLink } from 'lucide-react'
import Loader from '../../components/ui/Loader.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { useUiStore } from '../../store/uiStore.js'

const TYPE_LABELS = {
  cap_restoration: 'Cap Restoration',
  cap_custom: 'Cap Custom',
  shoe_restoration: 'Shoe Restoration',
  shoe_custom: 'Shoe Custom',
  other: 'Other'
}

export default function RequestsPanel({ onChange }) {
  const [requests, setRequests] = useState([])
  const [state, setState] = useState('loading')
  const [filter, setFilter] = useState('')
  const toast = useUiStore((s) => s.toast)

  useEffect(() => {
    api
      .get('/service-requests')
      .then((res) => {
        setRequests(res.data.requests)
        setState('done')
      })
      .catch(() => setState('error'))
  }, [])

  const visible = useMemo(
    () => (filter ? requests.filter((r) => r.status === filter) : requests),
    [requests, filter]
  )

  const update = async (req, patch) => {
    setRequests((prev) => prev.map((r) => (r._id === req._id ? { ...r, ...patch } : r)))
    try {
      await api.put(`/service-requests/${req._id}`, patch)
      onChange?.()
    } catch (err) {
      toast(err.friendly || 'Update failed', 'error')
    }
  }

  if (state === 'loading') return <div className="py-16"><Loader /></div>
  if (state === 'error') return <EmptyState title="Couldn't load requests" />

  return (
    <div>
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setFilter('')} className={cn('chip h-8', !filter && 'chip-active')}>All</button>
        {Object.entries(REQUEST_STATUS_META).map(([id, m]) => (
          <button key={id} onClick={() => setFilter(id)} className={cn('chip h-8', filter === id && 'chip-active')}>
            {m.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Queue is clear" subtitle="Resto & custom requests from the storefront land here." />
      ) : (
        <motion.div layout className="grid gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {visible.map((r) => (
              <motion.div
                key={r._id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold text-silver">{r.refCode}</span>
                  <span className="rounded-full border border-white/12 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-zinc-400">
                    {TYPE_LABELS[r.type]}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold">{r.name}</p>
                <a
                  href={r.contact.startsWith('http') || r.contact.includes('.com') ? r.contact : `tel:${r.contact}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 underline underline-offset-2 hover:text-silver"
                >
                  {r.contact} <ExternalLink size={11} />
                </a>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">{r.description}</p>
                {r.budget && <p className="mt-2 text-xs text-zinc-600">Budget: {r.budget}</p>}

                {r.images.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {r.images.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="" className="h-14 w-14 rounded-lg border border-white/10 object-cover transition hover:border-silver" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3 border-t border-white/8 pt-4">
                  <select
                    value={r.status}
                    onChange={(e) => update(r, { status: e.target.value })}
                    className="select select-sm h-9 min-h-0 w-auto border-white/15 bg-black/60 text-xs focus:border-silver/60 focus:outline-none"
                  >
                    {Object.entries(REQUEST_STATUS_META).map(([id, m]) => (
                      <option key={id} value={id}>{m.label}</option>
                    ))}
                  </select>
                  <span className="ml-auto text-[0.62rem] uppercase tracking-wider text-zinc-600">{formatDate(r.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
