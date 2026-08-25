import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-[clamp(6rem,25vw,16rem)] leading-none text-stroke-faint"
      >
        404
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h1 className="mt-4 font-display text-3xl uppercase tracking-wide">Wrong Turn On The Rack</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-500">
          This page got sold out or never existed. Either way — the good stuff is one click away.
        </p>
        <Link to="/" className="btn-silver mt-8">
          Back to home
        </Link>
      </motion.div>
    </div>
  )
}
