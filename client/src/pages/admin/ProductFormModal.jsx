import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../lib/api.js'
import { cn } from '../../lib/format.js'
import { CATEGORIES, CONDITIONS } from '../../lib/constants.js'
import { useUiStore } from '../../store/uiStore.js'
import { Upload, X } from 'lucide-react'

const emptyForm = {
  name: '',
  brand: '',
  category: 'tees',
  condition: 'thrifted',
  description: '',
  price: '',
  compareAtPrice: '',
  sizes: '',
  tags: '',
  stock: 1,
  featured: false,
  status: 'active',
  images: []
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(
    product
      ? {
          ...emptyForm,
          ...product,
          compareAtPrice: product.compareAtPrice ?? '',
          sizes: product.sizes?.join(', ') || '',
          tags: product.tags?.join(', ') || ''
        }
      : emptyForm
  )
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useUiStore((s) => s.toast)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const addUrl = () => {
    const url = urlInput.trim()
    if (!/^https?:\/\//.test(url)) {
      toast('Image URL must start with http(s)://', 'error')
      return
    }
    setForm((f) => ({ ...f, images: [...f.images, url].slice(0, 10) }))
    setUrlInput('')
  }

  const upload = async (fileList) => {
    if (!fileList?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('kind', 'product')
      ;[...fileList].slice(0, 8).forEach((f) => fd.append('files', f))
      const res = await api.post('/uploads/admin', fd)
      setForm((f) => ({ ...f, images: [...f.images, ...res.data.urls].slice(0, 10) }))
      toast(`${res.data.urls.length} image(s) uploaded`, 'success')
    } catch (err) {
      toast(err.friendly || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.price === '' || Number(form.price) < 0) {
      toast('Name and a valid price are required', 'error')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || 'Unbranded',
      category: form.category,
      condition: form.condition,
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice === '' ? null : Number(form.compareAtPrice),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(/[,\s]+/).filter(Boolean),
      stock: Math.max(0, Number(form.stock) || 0),
      featured: Boolean(form.featured),
      status: form.status,
      images: form.images
    }
    try {
      if (product) await api.put(`/products/${product._id}`, payload)
      else await api.post('/products', payload)
      toast(product ? 'Listing updated' : 'Listing created', 'success')
      onSaved()
    } catch (err) {
      toast(err.friendly || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="w-full max-w-2xl rounded-2xl border border-white/12 bg-zinc-950 p-6 md:p-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl uppercase tracking-wider">
            {product ? 'Edit listing' : 'New listing'}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-white/5 hover:text-white">
            <X size={17} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name *"><input value={form.name} onChange={set('name')} className={inputCls} required /></Field>
          <Field label="Brand"><input value={form.brand} onChange={set('brand')} placeholder="Nike, Vintage…" className={inputCls} /></Field>
          <Field label="Category">
            <select value={form.category} onChange={set('category')} className={selectCls}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Condition">
            <select value={form.condition} onChange={set('condition')} className={selectCls}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Price (₱) *"><input type="number" min="0" value={form.price} onChange={set('price')} className={inputCls} required /></Field>
          <Field label="Compare-at price"><input type="number" min="0" value={form.compareAtPrice ?? ''} onChange={set('compareAtPrice')} className={inputCls} /></Field>
          <Field label="Sizes (comma separated)"><input value={form.sizes} onChange={set('sizes')} placeholder="M, L, XL or 32, 34" className={inputCls} /></Field>
          <Field label="Stock"><input type="number" min="0" value={form.stock} onChange={set('stock')} className={inputCls} /></Field>
        </div>

        <Field label="Tags (space/comma separated)" className="mt-4">
          <input value={form.tags} onChange={set('tags')} placeholder="y2k denim vintage" className={inputCls} />
        </Field>

        <Field label="Description" className="mt-4">
          <textarea value={form.description} onChange={set('description')} rows={3} className={cn(inputCls, 'resize-y !h-auto py-2.5')} />
        </Field>

        <Field label={`Images (${form.images.length}/10)`} className="mt-4">
          <label className={cn(
            'mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-xs text-zinc-400 transition hover:border-silver/50',
            uploading && 'pointer-events-none opacity-50'
          )}>
            <Upload size={16} className="text-silver" />
            {uploading ? 'Uploading…' : 'Or upload files from your device'}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          </label>
          {form.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {form.images.map((url, i) => (
                <div key={`${url}-${i}`} className="group relative">
                  <img src={url} alt="" className="h-16 w-16 rounded-lg border border-white/10 object-cover" />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, x) => x !== i) }))}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 text-[0.55rem] font-bold uppercase tracking-wider text-silver">Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Field>

        <div className="mt-6 flex items-center gap-6 border-t border-white/8 pt-5">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={set('featured')} className="toggle toggle-sm border-white/20 bg-zinc-700 checked:border-transparent checked:bg-gradient-to-b checked:from-[#ececf1] checked:to-[#c6c6cc]" />
            Featured drop
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            Status:
            <select value={form.status} onChange={set('status')} className={cn(selectCls, '!h-9 w-auto')}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <button type="submit" disabled={saving} className="btn-silver ml-auto !h-10 !text-[0.68rem]">
            {saving ? 'Saving…' : product ? 'Save changes' : 'Create listing'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function Field({ label, className = '', children }) {
  return (
    <label className={cn('block', className)}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'input h-11 w-full border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none placeholder:text-zinc-600'
const selectCls =
  'select h-11 w-full border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none'
