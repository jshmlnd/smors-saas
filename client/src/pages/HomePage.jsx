import HomePageHero from '../components/home/Hero.jsx'
import FeaturedDrops from '../components/home/FeaturedDrops.jsx'
import CategoryTiles from '../components/home/CategoryTiles.jsx'
import ServicesTeaser from '../components/home/ServicesTeaser.jsx'
import Marquee from '../components/ui/Marquee.jsx'
import { RefreshCw, ShieldCheck, Sparkles, Truck } from 'lucide-react'

const VALUES = [
  { icon: ShieldCheck, title: 'Auth Checked', sub: 'Every piece verified before listing' },
  { icon: RefreshCw, title: 'Cleaned & Revived', sub: 'Sanitized, steamed and photo-ready' },
  { icon: Truck, title: 'J&T Nationwide', sub: 'Or door-to-door within Metro Manila' },
  { icon: Sparkles, title: 'Customs In-House', sub: 'Cap & shoe restos by SMORS Customs' }
]

export default function HomePage() {
  return (
    <>
      <HomePageHero />

      <div className="-rotate-1 border-y border-white/8 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 py-1 my-4">
        <Marquee
          items={[
            'Thrifted',
            'Collection',
            'One of One',
            'Restorations',
            'Customs',
            'Hustle',
            'Lifestyle',
            'Balance',
          ]}
        />
      </div>

      <FeaturedDrops />
      <CategoryTiles />
      <ServicesTeaser />

      <section className="border-y border-white/8 bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 md:grid-cols-4 md:px-6">
          {VALUES.map((v, i) => (
            <div key={v.title} className="flex flex-col items-start gap-3 text-left">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-silver/25 bg-silver/5 text-silver">
                <v.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider">{v.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{v.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 60% at 50% 100%, rgba(198,198,204,0.08) 0%, transparent 70%)'
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <p className="field-label">The community</p>
          <h2 className="font-display text-[clamp(2.8rem,8vw,6rem)] uppercase leading-[0.9]">
            Join The
            <br />
            <span className="text-stroke">Hustle</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-zinc-400">
            Fresh drops get posted first on Facebook. Follow both pages for restocks,
            resto transformations and custom work.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="https://www.facebook.com/smorscollection"
              target="_blank"
              rel="noreferrer"
              className="btn-silver"
            >
              SMORS Collection
            </a>
            <a
              href="https://www.facebook.com/smorscustoms"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              SMORS Customs
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
