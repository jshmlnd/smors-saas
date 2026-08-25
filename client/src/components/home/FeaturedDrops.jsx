import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api.js'
import ProductCard from '../product/ProductCard.jsx'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Reveal from '../ui/Reveal.jsx'

export default function FeaturedDrops() {
  const [items, setItems] = useState([])
  const [state, setState] = useState('loading')
  const trackRef = useRef(null)

  useEffect(() => {
    let live = true
    api
      .get('/products', { params: { featured: 'true', limit: 8 } })
      .then((res) => {
        if (!live) return
        setItems(res.data.items)
        setState('done')
      })
      .catch(() => live && setState('error'))
    return () => {
      live = false
    }
  }, [])

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <section className="section-pad relative">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="field-label !mb-1">Fresh from the racks</p>
            <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
              Featured <span className="text-stroke">Drops</span>
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => scroll(-1)} aria-label="Scroll left" className={navBtn}>
              <ArrowLeft size={17} />
            </button>
            <button onClick={() => scroll(1)} aria-label="Scroll right" className={navBtn}>
              <ArrowRight size={17} />
            </button>
          </div>
        </Reveal>

        {state === 'loading' && (
          <div className="flex gap-5 overflow-hidden pb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-[260px] shrink-0 space-y-3">
                <div className="skeleton aspect-square rounded-2xl opacity-30" />
                <div className="skeleton h-4 w-3/4 rounded-full opacity-20" />
                <div className="skeleton h-4 w-1/3 rounded-full opacity-20" />
              </div>
            ))}
          </div>
        )}

        {state === 'done' && items.length > 0 && (
          <div
            ref={trackRef}
            className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((p, i) => (
              <div key={p._id} className="w-[240px] shrink-0 snap-start md:w-[270px]">
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        )}

        {state === 'done' && items.length === 0 && (
          <p className="text-sm text-zinc-500">Featured pieces are being restocked. Check back soon.</p>
        )}

        <Reveal className="mt-10 text-center">
          <Link to="/shop" className="btn-ghost">
            View all pieces <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

const navBtn =
  'grid h-11 w-11 place-items-center rounded-full border border-white/15 text-zinc-300 transition hover:border-silver hover:text-white active:scale-95'
