import { AnimatePresence, motion } from 'framer-motion'
import { useUiStore } from '../../store/uiStore.js'

export default function Toaster() {
  const toasts = useUiStore((s) => s.toasts)

  return (
    <div className="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`pointer-events-auto rounded-full border px-5 py-2.5 text-sm font-medium shadow-xl backdrop-blur-md ${
              t.type === 'error'
                ? 'border-red-400/30 bg-red-950/80 text-red-200'
                : t.type === 'success'
                  ? 'border-emerald-400/25 bg-emerald-950/80 text-emerald-200'
                  : 'border-white/15 bg-zinc-900/90 text-zinc-100'
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
