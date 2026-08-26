import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../lib/api.js'
import { peso, cn, copyText } from '../lib/format.js'
import { PAYMENT_METHODS, SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD } from '../lib/constants.js'
import SmartImage from '../components/ui/SmartImage.jsx'
import { ArrowRight, Check, Copy, ShieldCheck, Truck, Upload } from 'lucide-react'
import { useCartStore } from '../store/cartStore.js'
import { useOrderHistoryStore } from '../store/orderHistoryStore.js'
import { useUiStore } from '../store/uiStore.js'

const STEPS = ['Details', 'Shipping', 'Payment', 'Review']

const initialForm = {
  name: '',
  phone: '',
  email: '',
  messenger: '',
  line: '',
  city: '',
  province: '',
  postal: '',
  notes: ''
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const toast = useUiStore((s) => s.toast)
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [shippingMethod, setShippingMethod] = useState('jt')
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [proofUrl, setProofUrl] = useState('')
  const [paymentRefNo, setPaymentRefNo] = useState('')
  const [uploading, setUploading] = useState(false)
  const [placing, setPlacing] = useState(false)

  const subtotal = useMemo(() => items.reduce((n, i) => n + i.qty * i.price, 0), [items])
  const baseFee = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.fee ?? 0
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseFee
  const total = subtotal + shippingFee

  if (items.length === 0 && !placing) return <Navigate to="/cart" replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const go = (next) => {
    if (!validateStep(step)) return
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  function validateStep(s) {
    if (s === 0) {
      if (!form.name.trim() || !form.phone.trim() || !form.line.trim() || !form.city.trim() || !form.province.trim()) {
        toast('Fill in name, mobile and full address', 'error')
        return false
      }
    }
    if (s === 2) {
      if (!paymentMethod) {
        toast('Pick a payment method', 'error')
        return false
      }
      if (!proofUrl) {
        toast('Upload your proof of payment to continue', 'error')
        return false
      }
    }
    return true
  }

  const onProof = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('kind', 'payment-proof')
      fd.append('files', file)
      const res = await api.post('/uploads/public', fd)
      setProofUrl(res.data.urls[0])
      toast('Receipt attached', 'success')
    } catch (err) {
      toast(err.friendly || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const placeOrder = async () => {
    setPlacing(true)
    try {
      const res = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          messenger: form.messenger,
          address: { line: form.line, city: form.city, province: form.province, postal: form.postal }
        },
        shippingMethod,
        paymentMethod,
        paymentProofUrl: proofUrl,
        paymentRefNo,
        notes: form.notes
      })
      useOrderHistoryStore.getState().addOrder({
        ref: res.data.refCode,
        total: res.data.total,
        status: 'payment_review',
        placedAt: new Date().toISOString()
      })
      clearCart()
      navigate(`/order/${res.data.refCode}`, { state: { fresh: true } })
    } catch (err) {
      toast(err.friendly || 'Could not place order', 'error')
      setPlacing(false)
    }
  }

  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod)
  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shippingMethod)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-36 pt-28 md:px-6 md:pt-36 lg:pb-24">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 font-display text-4xl uppercase tracking-wide md:text-5xl"
      >
        Check<span className="text-stroke">out</span>
      </motion.h1>

      <Stepper step={step} onJump={(i) => i < step && go(i)} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 md:p-8"
            >
              {step === 0 && (
                <>
                  <h2 className="mb-6 font-display text-2xl uppercase tracking-wider">Your details</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name *" value={form.name} onChange={set('name')} placeholder="Juan Dela Cruz" />
                    <Field label="Mobile number *" value={form.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" />
                    <Field label="Email (optional)" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
                    <Field label="Messenger link (optional)" value={form.messenger} onChange={set('messenger')} placeholder="fb.com/yourname" />
                  </div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
                    <Field label="House / street / barangay *" value={form.line} onChange={set('line')} placeholder="123 Hustle St., Brgy. Balance" />
                    <Field label="City *" value={form.city} onChange={set('city')} placeholder="Quezon City" />
                    <Field label="Province *" value={form.province} onChange={set('province')} placeholder="Metro Manila" />
                  </div>
                  <Field label="Postal code" value={form.postal} onChange={set('postal')} placeholder="1100" className="mt-5 sm:w-1/3" />
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="mb-6 font-display text-2xl uppercase tracking-wider">Shipping method</h2>
                  <div className="space-y-3">
                    {SHIPPING_METHODS.map((m) => {
                      const active = shippingMethod === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setShippingMethod(m.id)}
                          className={cn(
                            'flex w-full items-center justify-between gap-4 rounded-xl border p-5 text-left transition-all',
                            active ? 'border-silver bg-silver/[0.07]' : 'border-white/12 hover:border-white/30'
                          )}
                        >
                          <div>
                            <p className="font-semibold">{m.label}</p>
                            <p className="mt-1 text-xs text-zinc-500">{m.eta} — {m.note}</p>
                          </div>
                          <span className="shrink-0 font-display text-lg tracking-wide text-silver">
                            {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : peso(m.fee)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                    <Truck size={15} className="text-silver" />
                    Orders over {peso(FREE_SHIPPING_THRESHOLD)} ship free.
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="mb-6 font-display text-2xl uppercase tracking-wider">Payment</h2>
                  <div className="flex flex-wrap gap-3">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={cn(
                          'rounded-xl border px-6 py-3 font-semibold transition-all',
                          paymentMethod === m.id
                            ? 'border-silver bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black'
                            : 'border-white/12 text-zinc-300 hover:border-white/35'
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {selectedPayment && (
                      <motion.div
                        key={selectedPayment.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 space-y-5"
                      >
                        <div className="rounded-xl border border-silver/25 bg-silver/[0.05] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-zinc-400">Send exactly</p>
                              <p className="font-display text-3xl tracking-wide">{peso(total)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                await copyText(selectedPayment.accountNumber.replace(/\s/g, ''))
                                toast('Account number copied', 'success')
                              }}
                              className="btn-ghost h-9 px-4 !text-[0.62rem]"
                            >
                              <Copy size={13} /> Copy number
                            </button>
                          </div>
                          <div className="mt-4 space-y-1 border-t border-dashed border-white/12 pt-4 text-sm">
                            <p><span className="text-zinc-500">Account name:</span> <span className="font-semibold">{selectedPayment.accountName}</span></p>
                            <p><span className="text-zinc-500">Number:</span> <span className="font-semibold tracking-wider">{selectedPayment.accountNumber}</span></p>
                          </div>
                        </div>

                        <ol className="space-y-2 text-sm text-zinc-400">
                          {selectedPayment.steps.map((s, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="font-display text-silver">{String(i + 1).padStart(2, '0')}</span>
                              {s}
                            </li>
                          ))}
                        </ol>

                        <div>
                          <p className="field-label">Proof of payment *</p>
                          {proofUrl ? (
                            <div className="flex items-center gap-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
                              <img src={proofUrl} alt="Payment proof" className="h-16 w-16 rounded-lg border border-white/15 object-cover" />
                              <div className="flex-1">
                                <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                                  <Check size={14} /> Receipt attached
                                </p>
                                <button type="button" onClick={() => setProofUrl('')} className="mt-1 text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300">
                                  Replace
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className={cn(
                              'flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/20 px-6 py-7 text-center transition hover:border-silver/50',
                              uploading && 'pointer-events-none opacity-50'
                            )}>
                              <Upload size={22} className="text-silver" />
                              <span className="text-sm text-zinc-400">{uploading ? 'Uploading…' : 'Upload screenshot of your receipt'}</span>
                              <input type="file" accept="image/*" hidden onChange={(e) => onProof(e.target.files?.[0])} />
                            </label>
                          )}
                        </div>

                        <Field
                          label="Reference number (optional)"
                          value={paymentRefNo}
                          onChange={(e) => setPaymentRefNo(e.target.value)}
                          placeholder="e.g. GCash ref no."
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="mb-6 font-display text-2xl uppercase tracking-wider">Review order</h2>
                  <div className="space-y-6">
                    <ReviewBlock title="Ship to">
                      <p className="font-medium">{form.name}</p>
                      <p>{form.line}, {form.city}, {form.province} {form.postal}</p>
                      <p className="text-zinc-500">{form.phone}{form.email ? ` · ${form.email}` : ''}</p>
                    </ReviewBlock>
                    <ReviewBlock title="Shipping & Payment">
                      <p>{selectedShipping?.label} — {shippingFee === 0 ? 'FREE' : peso(shippingFee)}</p>
                      <p className="capitalize">{selectedPayment?.label}</p>
                      {paymentRefNo && <p className="text-zinc-500">Ref: {paymentRefNo}</p>}
                    </ReviewBlock>
                    <ReviewBlock title={`Items (${items.length})`}>
                      <ul className="space-y-3">
                        {items.map((i) => (
                          <li key={i.key} className="flex items-center gap-3">
                            <SmartImage src={i.image} alt="" className="h-12 w-12 shrink-0 rounded-lg" />
                            <span className="flex-1 text-sm">
                              {i.name}
                              <span className="text-zinc-500"> ×{i.qty}{i.size ? ` · ${i.size}` : ''}</span>
                            </span>
                            <span className="text-sm font-semibold">{peso(i.price * i.qty)}</span>
                          </li>
                        ))}
                      </ul>
                    </ReviewBlock>
                    <div>
                      <p className="field-label">Notes for the team (optional)</p>
                      <textarea value={form.notes} onChange={set('notes')} rows={2} className={cn(inputCls, 'resize-none')} placeholder="Delivery instructions, size checks…" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="hidden items-center justify-between gap-3 border-t border-white/8 p-6 md:px-8 lg:flex">
            <button
              type="button"
              onClick={() => (step === 0 ? navigate('/cart') : go(step - 1))}
              className="btn-ghost h-11 !px-6 !text-[0.68rem]"
            >
              Back
            </button>
            {step < 3 ? (
              <button type="button" onClick={() => go(step + 1)} className="btn-silver !h-11 !px-7 !text-[0.72rem]">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button type="button" onClick={placeOrder} disabled={placing} className="btn-silver !h-11 !px-7 !text-[0.72rem]">
                {placing ? 'Placing…' : `Place Order · ${peso(total)}`}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-xl uppercase tracking-wider">Order total</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            <Row label={`Subtotal (${items.reduce((n, i) => n + i.qty, 0)} pcs)`} value={peso(subtotal)} />
            <Row label="Shipping" value={shippingFee === 0 ? 'FREE' : peso(shippingFee)} />
          </div>
          <div className="mt-4 flex justify-between border-t border-dashed border-white/12 pt-4">
            <span className="font-display text-lg uppercase tracking-wider">Total</span>
            <motion.span key={total} initial={{ scale: 1.08 }} animate={{ scale: 1 }} className="font-display text-2xl text-silver">
              {peso(total)}
            </motion.span>
          </div>
          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-silver" />
            We verify payments within a few hours and message you updates on Facebook. One-of-one pieces are reserved the moment you order.
          </p>
          <Link to="/shop" className="mt-5 inline-block text-xs text-zinc-500 underline underline-offset-4 transition hover:text-zinc-200">
            Continue shopping
          </Link>
        </aside>
      </div>

      <div className="action-bar lg:hidden">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate('/cart') : go(step - 1))}
          className="btn-ghost h-12 shrink-0 !px-5 !text-[0.68rem]"
        >
          Back
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-zinc-500">Total</p>
          <motion.span key={total} initial={{ scale: 1.08 }} animate={{ scale: 1 }} className="font-display text-xl leading-tight tracking-wide text-silver">
            {peso(total)}
          </motion.span>
        </div>
        {step < 3 ? (
          <button type="button" onClick={() => go(step + 1)} className="btn-silver h-12 shrink-0 !px-6 !text-[0.72rem]">
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={placeOrder} disabled={placing} className="btn-silver h-12 shrink-0 !px-6 !text-[0.72rem]">
            {placing ? 'Placing…' : 'Place Order'}
          </button>
        )}
      </div>
    </div>
  )
}

function Stepper({ step, onJump }) {
  return (
    <ol className="flex items-center gap-2 md:gap-3">
      {STEPS.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <li key={label} className="flex flex-1 items-center gap-2 md:gap-3">
            <button
              onClick={() => done && onJump(i)}
              disabled={!done}
              className={cn('flex items-center gap-2', done && 'cursor-pointer')}
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold transition-all duration-300',
                  active
                    ? 'border-transparent bg-gradient-to-b from-[#ececf1] to-[#c6c6cc] text-black shadow-[0_0_18px_rgba(198,198,204,0.35)]'
                    : done
                      ? 'border-silver/60 text-silver'
                      : 'border-white/12 text-zinc-600'
                )}
              >
                {done ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-[0.62rem] font-semibold uppercase tracking-[0.2em] sm:block',
                  active ? 'text-white' : 'text-zinc-500'
                )}
              >
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="relative h-px flex-1 overflow-hidden bg-white/10">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-silver"
                  animate={{ width: i < step ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

const inputCls =
  'input h-11 w-full border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none placeholder:text-zinc-600'

function Field({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="field-label">{label}</label>}
      <input className={inputCls} {...props} />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-zinc-400">
      <span>{label}</span>
      <span className="font-semibold text-zinc-100">{value}</span>
    </div>
  )
}

function ReviewBlock({ title, children }) {
  return (
    <div className="rounded-xl border border-white/8 p-4">
      <p className="field-label">{title}</p>
      <div className="text-sm leading-relaxed text-zinc-300">{children}</div>
    </div>
  )
}
