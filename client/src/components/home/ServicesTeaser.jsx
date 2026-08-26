import { Link } from 'react-router-dom'
import Reveal from '../ui/Reveal.jsx'
import SmartImage from '../ui/SmartImage.jsx'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { SOCIALS } from '../../lib/constants.js'

const PANELS = [
  {
    title: 'Caps',
    tag: 'SMORS Customs',
    src: 'https://anatta.ca/collections/hats?srsltid=AfmBOopMg2Zwev8aJgmFd8m1QE08QqCgRsBuQTjTm4UIslffFrb5ImX4',
    services: ['Deep cleaning & reshaping', 'Brim repaint', 'Custom embroidery-ready prep'],
    href: '/services?type=cap'
  },
  {
    title: 'Shoes',
    tag: 'SMORS Customs',
    src: 'https://scontent.fcrk3-1.fna.fbcdn.net/v/t39.30808-6/775398950_1060592383010117_7210543882940982165_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1536x2048&ctp=s1536x2048&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGfpnAVhyWwJ5VxM5bHgua43WZjH7KyYK3dZmMfsrJgrU7V-LpsCrS4aUbzDOKCPXq46LGjGFYbPjdmtYvmxTcW&_nc_ohc=VDCWUsJiAcgQ7kNvwEI8Tj_&_nc_oc=Adq3SMR15yD8_F6t0laI9HNE-coo_LIpH7xI4FWCthQrruSFRUxw1HUTa1ei9Ss7Sv3grncj70W_xCccn7EUMenb&_nc_zt=23&_nc_ht=scontent.fcrk3-1.fna&_nc_gid=h9B5K-1L8DSYMY4yGCPiJg&_nc_ss=7b2a8&oh=00_AQEGEMyPio69x4yaLUWdF69temThFc016t_O_SFVteI99Q&oe=6A94593F',
    services: ['Full restoration & reglue', 'Midsole repaint', 'Custom colorways'],
    href: '/services?type=shoe'
  }
]

export default function ServicesTeaser() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="field-label !mb-1">Beyond the racks</p>
            <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
              Resto <span className="text-stroke">&</span> Customs
            </h2>
          </div>
          <a
            href={SOCIALS.customs}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost h-10 !text-[0.68rem]"
          >
            <ExternalLink size={13} /> SMORS Customs on FB
          </a>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {PANELS.map((panel, i) => (
            <Reveal key={panel.title} delay={i * 0.12}>
              <Link
                to={panel.href}
                className="group relative block aspect-[16/11] overflow-hidden rounded-2xl border border-white/8"
              >
                <SmartImage
                  src={panel.src}
                  alt={panel.title}
                  category={panel.title.toLowerCase()}
                  imgClassName="h-full w-full transition-transform duration-[1.2s] ease-out group-hover:scale-[1.07]"
                  className="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 md:p-8">
                  <span className="w-fit rounded-full border border-silver/30 bg-black/40 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-silver backdrop-blur-sm">
                    {panel.tag}
                  </span>
                  <h3 className="font-display text-4xl uppercase tracking-wide md:text-5xl">{panel.title}</h3>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                    {panel.services.map((s) => (
                      <li key={s} className="flex items-center gap-1.5">
                        <span className="h-1 w-1 rotate-45 bg-silver" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-1 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-zinc-200 transition-all group-hover:gap-3.5 group-hover:text-white">
                    Book a slot <ArrowRight size={14} aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
