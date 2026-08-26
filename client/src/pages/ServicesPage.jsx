import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Reveal from '../components/ui/Reveal.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import { ChevronDown, ChevronsLeftRight, ExternalLink, Upload, X } from 'lucide-react'
import api from '../lib/api.js'
import { useUiStore } from '../store/uiStore.js'
import { cn } from '../lib/format.js'
import { SOCIALS } from '../lib/constants.js'

const SERVICES = [
  { id: 'cap_restoration', label: 'Cap Restoration' },
  { id: 'cap_custom', label: 'Cap Custom' },
  { id: 'shoe_restoration', label: 'Shoe Restoration' },
  { id: 'shoe_custom', label: 'Shoe Custom' },
  { id: 'other', label: 'Something Else' }
]

const STEPS = [
  ['01', 'Send Photos', 'Snap your caps or kicks from every angle and send them over with a short description.'],
  ['02', 'Get a Quote', 'We assess the damage (or the dream) and reply with pricing plus a timeline within 24–48 hours.'],
  ['03', 'The Revival', 'Deep cleaning, reglue, repaint, midsole swap — whatever your piece needs to run again.'],
  ['04', 'Doorstep Drop', 'Pick it up or we ship it back via J&T with before/after photos for the receipts.']
]

const PRICING = [
  ['Basic clean (caps & shoes)', '₱150+'],
  ['Deep clean + deodorize', '₱250+'],
  ['Reglue / sole repair', '₱350+'],
  ['Midsole repaint', '₱600+'],
  ['Full shoe restoration', '₱900+'],
  ['Custom colorway (from)', '₱1,200+'],
  ['Cap reshaping + brim repaint', '₱500+']
]

const FAQS = [
  [
    'How long does a restoration take?',
    'Standard jobs wrap in 3–7 days. Custom paint work runs 1–2 weeks depending on complexity. You get progress shots either way.'
  ],
  [
    'Will custom paint crack or fade?',
    'We use flexible leather/acrylic paints with sealant — they bend with the material. Proper care instructions come with every return.'
  ],
  [
    'Do you accept shipped-in items?',
    'Yes. Ship via J&T anywhere in PH, or drop off / meet up within Metro Manila. We document everything on video before starting.'
  ],
  [
    'What if my shoes are beyond saving?',
    'Honest answer first, always. If restoration costs more than the piece is worth, we tell you straight up.'
  ]
]

export default function ServicesPage() {
  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 50% at 70% 20%, rgba(198,198,204,0.08) 0%, transparent 70%)'
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-24 md:px-6 md:pb-20 md:pt-36">
          <Reveal>
            <p className="field-label !mb-2">SMORS Customs · Caps & Kicks</p>
          </Reveal>
          <h1 className="font-display text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.9] tracking-wide">
            Bring It
            <br />
            <span className="text-stroke">Back To Life</span>
          </h1>
          <p className="mt-6 max-w-lg leading-relaxed text-zinc-400">
            SMORS Customs restores beat caps and deadstock dreams — deep cleans, reglues,
            repaints and full custom colorways. If it deserves a second run, we build it.
          </p>
          <a href={SOCIALS.customs} target="_blank" rel="noreferrer" className="btn-silver mt-8">
            <ExternalLink size={15} /> See our work on FB
          </a>
        </div>
      </section>

      <BeforeAfter />

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <Reveal className="mb-12">
          <p className="field-label !mb-1">How it works</p>
          <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
            The <span className="text-stroke">Process</span>
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-4 md:gap-5">
          {STEPS.map(([num, title, body], i) => (
            <Reveal key={num} delay={i * 0.1}>
              <div className="group relative h-full rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition-colors hover:border-silver/40">
                <span className="font-display text-5xl text-stroke-faint transition-all duration-300 group-hover:text-stroke">
                  {num}
                </span>
                <h3 className="mt-5 font-display text-xl uppercase tracking-wider">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <PricingFaq />

      <RequestForm />
    </div>
  )
}

function BeforeAfter() {
  const [pos, setPos] = useState(50)
  const ref = useRef(null)
  const dragging = useRef(false)

  const move = (clientX) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos(Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)))
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <Reveal>
        <div
          ref={ref}
          onMouseDown={(e) => {
            dragging.current = true
            move(e.clientX)
          }}
          onMouseMove={(e) => dragging.current && move(e.clientX)}
          onMouseUp={() => (dragging.current = false)}
          onMouseLeave={() => (dragging.current = false)}
          onTouchStart={(e) => move(e.touches[0].clientX)}
          onTouchMove={(e) => move(e.touches[0].clientX)}
          className="relative aspect-[16/9] cursor-ew-resize select-none overflow-hidden rounded-2xl border border-white/10"
        >
          <img
            src="https://scontent.fcrk3-4.fna.fbcdn.net/v/t39.30808-6/785277507_1065613952507960_3267590257961567777_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1350&ctp=s1080x1350&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFVoN5WTI41mFzQK24RBamFp24-xcNhofKnbj7Fw2Gh8uxeBNlv49x7q7AF3pgA0doRXEBfVBMFCM8WvGbjS8x6&_nc_ohc=fcopWOYDVqkQ7kNvwGk2D9c&_nc_oc=AdrdtGyAk1psT4qTT-6Lxvq_aEOiIMNLdBcxQjfjfdPsxo7DLOrFbd7OC-UozqEcvhbAkIVHPGP780K5CIEl8mFk&_nc_zt=23&_nc_ht=scontent.fcrk3-4.fna&_nc_gid=3pAPv2pakQA1W8ofE9GuAQ&_nc_ss=7b2a8&oh=00_AQFdklbD18jHdPivcVY7tdRztN-EPWs8WmIsyDhXCFQz9A&oe=6A944CE0"
            alt="Restored sneakers"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-y-0 left-0 w-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          >
            <img
              src="https://scontent.fcrk3-4.fna.fbcdn.net/v/t39.30808-6/786071048_1065613949174627_7702659685269611611_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1080x1350&ctp=s1080x1350&_nc_cat=109&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHd8BeOu4Ndh1l24AvPOuJv8ekRYRgdSAnx6RFhGB1ICWDRSjkYw0vUz0mrEV_5uWbUDFbQxodXrUIOB1qHhqJo&_nc_ohc=UmOpsnyUAO0Q7kNvwG1itrZ&_nc_oc=AdpOFJUkU3wtmVu5teRZvjWZLbSx9ktTW1pB7Pnp9qMSF76gahLBw9vfxCeaSAUNUIljiuPM8Vb2Up_U4Eeyra8H&_nc_zt=23&_nc_ht=scontent.fcrk3-4.fna&_nc_gid=UyfLOCp6nC2kYlcyQiNfWQ&_nc_ss=7b2a8&oh=00_AQHm_nsWeE6g_JzJO3TT51wxPyKZOYGSMnAyiPNACInGMg&oe=6A944CF8"
              alt="Worn sneakers"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: 'grayscale(0.85) sepia(0.45) brightness(0.62) contrast(0.92)' }}
            />
            <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.25em] backdrop-blur-sm">
              Before
            </span>
          </div>
          <span className="absolute bottom-4 right-4 rounded-full bg-silver px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.25em] text-black">
            After
          </span>

          <div
            className="absolute inset-y-0 w-[2px] bg-silver shadow-[0_0_18px_rgba(198,198,204,0.8)]"
            style={{ left: `${pos}%` }}
          >
            <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-silver text-black shadow-xl">
              <ChevronsLeftRight size={18} />
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs uppercase tracking-[0.25em] text-zinc-600">
          Drag to compare · Actual resto by SMORS Customs
        </p>
      </Reveal>
    </section>
  )
}

function PricingFaq() {
  return (
    <section className="border-y border-white/8 bg-white/[0.015]">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 md:grid-cols-2 md:px-6">
        <Reveal>
          <p className="field-label !mb-1">Ballpark</p>
          <h2 className="font-display text-3xl uppercase tracking-wide md:text-4xl">Service Rates</h2>
          <ul className="mt-7 divide-y divide-white/8 rounded-2xl border border-white/8">
            {PRICING.map(([service, price]) => (
              <li key={service} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                <span className="text-zinc-300">{service}</span>
                <span className="shrink-0 font-display text-base tracking-wider text-silver">{price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-zinc-600">
            Final quote depends on damage level and materials. Downpayment required for customs.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="field-label !mb-1">Good to know</p>
          <h2 className="font-display text-3xl uppercase tracking-wide md:text-4xl">FAQs</h2>
          <div className="mt-7 space-y-px overflow-hidden rounded-2xl border border-white/8">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group border-b border-white/8 last:border-0 open:bg-white/[0.03]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown size={16} className="shrink-0 text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">{a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function RequestForm() {
  const toast = useUiStore((s) => s.toast)
  const [form, setForm] = useState({ type: 'shoe_restoration', name: '', contact: '', description: '', budget: '' })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [doneRef, setDoneRef] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onFiles = async (fileList) => {
    if (!fileList?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('kind', 'service')
      ;[...fileList].slice(0, 4).forEach((f) => fd.append('files', f))
      const res = await api.post('/uploads/public', fd)
      setImages((prev) => [...prev, ...res.data.urls].slice(0, 4))
      toast('Photos attached', 'success')
    } catch (err) {
      toast(err.friendly || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || !form.description.trim()) {
      toast('Fill in name, contact and description', 'error')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/service-requests', { ...form, images })
      setDoneRef(res.data.refCode)
    } catch (err) {
      toast(err.friendly || 'Could not send request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (doneRef) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center md:px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black shadow-[0_0_50px_rgba(198,198,204,0.35)]"
        >
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12.5l5 5L20 7" />
          </svg>
        </motion.div>
        <h2 className="mt-6 font-display text-3xl uppercase tracking-wide md:text-4xl">Request Received</h2>
        <p className="mt-3 text-zinc-400">
          Reference <span className="font-mono font-bold text-silver">{doneRef}</span> — we'll get back to you
          with a quote within 24–48 hours via your contact info.
        </p>
        <button onClick={() => setDoneRef(null)} className="btn-ghost mt-8 h-11 !text-[0.68rem]">
          Send another request
        </button>
      </section>
    )
  }

  return (
    <section id="request" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 md:px-6">
      <Reveal>
        <p className="field-label !mb-1">Ready when you are</p>
        <h2 className="font-display text-4xl uppercase tracking-wide md:text-5xl">
          Request A <span className="text-stroke">Slot</span>
        </h2>
        <form onSubmit={submit} className="card-dark mt-8 space-y-5 p-6 md:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="svc-type">Service type</label>
              <select id="svc-type" value={form.type} onChange={set('type')} className={inputCls}>
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="svc-budget">Budget range (optional)</label>
              <input id="svc-budget" value={form.budget} onChange={set('budget')} placeholder="₱500 – ₱1,000" className={inputCls} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="svc-name">Name *</label>
              <input id="svc-name" value={form.name} onChange={set('name')} placeholder="Juan D." className={inputCls} required />
            </div>
            <div>
              <label className="field-label" htmlFor="svc-contact">FB link or mobile *</label>
              <input id="svc-contact" value={form.contact} onChange={set('contact')} placeholder="fb.com/juand / 0917…" className={inputCls} required />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="svc-desc">Tell us about the piece *</label>
            <textarea
              id="svc-desc"
              value={form.description}
              onChange={set('description')}
              rows={4}
              placeholder="What's the condition? What do you want done? Colorway ideas welcome."
              className={cn(inputCls, 'resize-none')}
              required
            />
          </div>

          <div>
            <p className="field-label">Reference photos (up to 4)</p>
            <label
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 px-6 py-8 text-center transition hover:border-silver/50',
                uploading && 'opacity-50 pointer-events-none'
              )}
            >
              <Upload size={22} className="text-silver" />
              <span className="text-sm text-zinc-400">{uploading ? 'Uploading…' : 'Click to attach photos'}</span>
              <input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            </label>
            {images.length > 0 && (
              <div className="mt-3 flex gap-3">
                {images.map((url, i) => (
                  <div key={url} className="relative">
                    <img src={url} alt="" className="h-16 w-16 rounded-xl border border-white/10 object-cover" />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => setImages(images.filter((_, x) => x !== i))}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500/90 text-white"
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-silver w-full">
            {submitting ? 'Sending…' : 'Send Request'}
          </button>
        </form>
      </Reveal>
    </section>
  )
}

const inputCls =
  'input h-11 w-full border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none placeholder:text-zinc-600'
