import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import api from '../../lib/api.js'
import { CATEGORIES } from '../../lib/constants.js'
import Reveal from '../ui/Reveal.jsx'

export default function CategoryTiles() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    api
      .get('/products/meta/categories')
      .then((res) =>
        setCounts(Object.fromEntries(res.data.counts.map((c) => [c._id, c.count])))
      )
      .catch(() => {})
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Reveal className="mb-10">
        <p className="field-label !mb-1">Browse by</p>
        <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
          The <span className="text-stroke">Categories</span>
        </h2>
      </Reveal>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={`/shop?category=${cat.id}`}
              className="group relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-colors duration-300 hover:border-transparent hover:bg-gradient-to-b hover:from-[#ececf1] hover:to-[#c0c0c8]"
            >
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-zinc-500 transition-colors group-hover:text-black/60">
                {counts[cat.id] ?? 0} piece{counts[cat.id] === 1 ? '' : 's'}
              </span>
              <span className="font-display text-2xl uppercase tracking-wide text-zinc-100 transition-colors group-hover:text-black md:text-3xl">
                {cat.label}
              </span>
              <ArrowRight size={16} className="absolute right-4 top-4 text-silver opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-black" aria-hidden />
            </Link>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: 0.21, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/shop"
            className="group relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-white/15 p-5 transition-colors hover:border-silver"
          >
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-zinc-600">Everything</span>
            <span className="font-display text-2xl uppercase tracking-wide text-stroke-faint group-hover:text-stroke md:text-3xl">
              View All
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
