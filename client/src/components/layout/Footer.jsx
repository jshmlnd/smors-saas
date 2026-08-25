import { Link } from 'react-router-dom'
import { ExternalLink, Cog, ShoppingBag, MapPin } from 'lucide-react'
import Marquee from '../ui/Marquee.jsx'
import { CATEGORIES, SOCIALS } from '../../lib/constants.js'

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/8">
      <div className="border-b border-white/8 py-2 text-center">
        <Marquee
          items={['Hustle', 'Lifestyle', 'Balance', 'Thrifted', 'Pre-Loved', 'Restored', 'Customized']}
          outline
          speed="44s"
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <Link to="/" className="flex items-baseline gap-1">
            <span className="font-display text-3xl tracking-widest">SMORS</span>
            <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#ececf1] to-[#9a9aa3]" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
            Curated thrifted and pre-loved pieces from Polangui, Albay. Every item hand-picked,
            checked and cleaned before it hits the rack.
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
            <MapPin size={14} className="inline-block mr-1 mb-1" />
            Candaba St. Magurang, Polangui, Philippines, 4506
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={SOCIALS.collection}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost h-9 px-4 !text-[0.65rem]"
            >
              <ShoppingBag size={13} /> Collection
            </a>
            <a
              href={SOCIALS.customs}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost h-9 px-4 !text-[0.65rem]"
            >
              <Cog size={13} /> Customs
            </a>
          </div>
        </div>

        <nav aria-label="Shop categories">
          <h4 className="field-label">Shop</h4>
          <ul className="mt-2 space-y-2.5">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/shop?category=${c.id}`}
                  className="text-sm text-zinc-400 transition-colors hover:text-silver"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <h4 className="field-label">Help</h4>
          <ul className="mt-2 space-y-2.5 text-sm text-zinc-400">
            <li>
              <Link to="/track" className="transition-colors hover:text-silver">Track my order</Link>
            </li>
            <li>
              <Link to="/services" className="transition-colors hover:text-silver">Restorations & customs</Link>
            </li>
            <li>
              <Link to="/cart" className="transition-colors hover:text-silver">View cart</Link>
            </li>
            <li className="pt-1 text-zinc-600">
              Pay via GCash · BDO · BPI
            </li>
            <li className="text-zinc-600">Ships via J&T or door-to-door</li>
          </ul>
        </nav>

        <div>
          <h4 className="field-label">The Vibe</h4>
          <p className="mt-2 font-display text-xl uppercase leading-tight tracking-wide">
            Hustle<span className="text-silver"> · </span>Lifestyle<span className="text-silver"> · </span>Balance
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Wear the grind. Keep the fit. Restore what deserves a second run.
          </p>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-[0.65rem] uppercase tracking-[0.25em] text-zinc-600 md:px-6">
          <span>© {new Date().getFullYear()} SMORS Collection</span>
          <span>Polangui · Philippines</span>
          <Link to="/admin/login" className="transition-colors hover:text-zinc-300">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
