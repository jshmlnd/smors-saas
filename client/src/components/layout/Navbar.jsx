import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore.js'
import { cn } from '../../lib/format.js'

const LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/services', label: 'Services' },
  { to: '/track', label: 'Track Order' }
]

const EASE = [0.22, 1, 0.36, 1]

const logoWave = {
  rest: { transition: { staggerChildren: 0.045 } },
  hover: { transition: { staggerChildren: 0.045 } }
}

const logoLetter = {
  rest: { y: 0 },
  hover: { y: [0, -5, 0], transition: { duration: 0.5, ease: 'easeInOut' } }
}

const logoDot = {
  rest: { scale: 1 },
  hover: { scale: 1.55, transition: { type: 'spring', stiffness: 400, damping: 13 } }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const inputRef = useRef(null)
  const { scrollY, scrollYProgress } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? y
    const delta = y - prev
    setScrolled(y > 10)
    if (delta > 2 && y > 140) setHidden(true)
    else if (delta < -2 || y <= 140) setHidden(false)
  })

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setSearchOpen(false)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    setSearchOpen(false)
    setMenuOpen(false)
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  return (
    <>
      <motion.header
        initial={{ y: '-110%' }}
        animate={{ y: hidden ? '-115%' : '0%' }}
        transition={
          hidden
            ? { duration: 0.3, ease: [0.4, 0, 1, 1] }
            : { type: 'spring', stiffness: 300, damping: 32 }
        }
        className={cn(
          'fixed inset-x-0 top-0 z-[60] transition-colors duration-300',
          scrolled ? 'border-b border-white/8 bg-black/75 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
        )}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 md:px-6',
            scrolled ? 'h-14 md:h-16' : 'h-16 md:h-[4.5rem]'
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5, ease: EASE }}
            className="inline-block"
          >
            <motion.div initial="rest" whileHover="hover" animate="rest">
              <Link to="/" aria-label="SMORS home" className="flex items-baseline gap-1">
                <motion.span variants={logoWave} className="font-display text-2xl tracking-[0.08em]">
                  {'SMORS'.split('').map((ch, i) => (
                    <motion.span key={i} variants={logoLetter} className="inline-block text-zinc-50">
                      {ch}
                    </motion.span>
                  ))}
                </motion.span>
                <motion.span
                  variants={logoDot}
                  className="ml-0.5 h-2 w-2 rounded-full bg-gradient-to-br from-[#ececf1] to-[#9a9aa3] shadow-[0_0_12px_rgba(198,198,204,0.7)]"
                />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            className="hidden items-center gap-8 md:flex"
          >
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className="group relative py-2" end={link.to === '/'}>
                {({ isActive }) => (
                  <>
                    <span className="relative block h-[1.3em] overflow-hidden">
                      <span
                        className={cn(
                          'block text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-transform duration-300 ease-out',
                          isActive ? 'text-white' : 'text-zinc-400'
                        )}
                      >
                        {link.label}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-0 block translate-y-full text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-silver transition-transform duration-300 ease-out group-hover:translate-y-0',
                          isActive && 'text-white'
                        )}
                      >
                        {link.label}
                      </span>
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver to-transparent shadow-[0_0_8px_rgba(198,198,204,0.8)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5, ease: EASE }}
            className="flex items-center gap-1.5"
          >
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  key="search"
                  onSubmit={submitSearch}
                  initial={{ width: 0, opacity: 0, x: 24 }}
                  animate={{ width: '13rem', opacity: 1, x: 0 }}
                  exit={{ width: 0, opacity: 0, x: 24 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                  className="hidden overflow-hidden md:block"
                >
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search the racks…"
                    className="h-9 w-full rounded-full border border-white/20 bg-white/5 px-4 text-sm text-zinc-100 shadow-[0_0_24px_rgba(198,198,204,0.08)] placeholder:text-zinc-500 focus:border-silver/60 focus:outline-none"
                  />
                </motion.form>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setSearchOpen((v) => !v)}
              whileTap={{ scale: 0.85 }}
              animate={{ backgroundColor: searchOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0)' }}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-zinc-300 transition-colors hover:text-white max-md:hidden"
            >
              <Search size={18} />
            </motion.button>

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              <motion.span
                key={count}
                animate={count > 0 ? { rotate: [0, -13, 10, -6, 0], scale: [1, 1.18, 1] } : {}}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="grid place-items-center"
              >
                <ShoppingBag size={18} />
              </motion.span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={`badge-${count}`}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] px-1 text-[0.62rem] font-bold text-black"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <motion.button
              onClick={() => setMenuOpen(true)}
              whileTap={{ scale: 0.85 }}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full text-zinc-200 transition hover:bg-white/5 md:hidden"
            >
              <Menu size={20} />
            </motion.button>
          </motion.div>
        </nav>

        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ scaleX: scrollYProgress }}
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-[#71717a] via-[#ececf1] to-[#71717a]"
            />
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.35, ease: [0.4, 0, 1, 1], delay: 0.1 } }}
            transition={{ duration: 0.55, ease: EASE }}
            className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-xl"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="font-display text-2xl tracking-widest"
              >
                SMORS
              </motion.span>
              <motion.button
                onClick={() => setMenuOpen(false)}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 22 }}
                whileTap={{ scale: 0.85 }}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full text-zinc-300 hover:bg-white/5"
              >
                <X size={20} />
              </motion.button>
            </div>

            <motion.form
              onSubmit={submitSearch}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="px-6 pt-6"
            >
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 focus-within:border-silver/50">
                <Search size={17} className="text-zinc-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the racks…"
                  className="h-11 w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </motion.form>

            <nav className="flex flex-1 flex-col items-start justify-center gap-3 px-8">
              {[{ to: '/', label: 'Home' }, ...LINKS].map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -48, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ delay: 0.28 + i * 0.08, duration: 0.5, ease: EASE }}
                  whileHover={{ x: 12 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline gap-4"
                  >
                    <span className="text-xs font-semibold tracking-widest text-silver">0{i + 1}</span>
                    <span className="font-display text-5xl uppercase tracking-wide text-zinc-200 transition-all duration-300 group-hover:text-stroke">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="flex items-center gap-3 px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] text-[0.65rem] uppercase tracking-[0.35em] text-zinc-600"
            >
              Hustle <span className="h-1 w-1 rotate-45 bg-silver/60" /> Lifestyle{' '}
              <span className="h-1 w-1 rotate-45 bg-silver/60" /> Balance
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
