import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/api.js'
import { useAuthStore } from '../store/authStore.js'
import { useUiStore } from '../store/uiStore.js'
import { ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const toast = useUiStore((s) => s.toast)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      setAuth(res.data.token, res.data.admin)
      navigate('/admin')
    } catch (err) {
      toast(err.friendly || 'Login failed', 'error')
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-black px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 45% at 50% 35%, rgba(198,198,204,0.09) 0%, transparent 70%)'
        }}
      />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl"
      >
        <Link to="/" className="mb-8 flex items-baseline justify-center gap-1">
          <span className="font-display text-3xl tracking-widest">SMORS</span>
          <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#ececf1] to-[#9a9aa3]" />
        </Link>
        <p className="field-label text-center">Back office · Admin access</p>

        <label className="mt-6 block">
          <span className="field-label">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input h-11 w-full border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none"
            placeholder="admin@smors.ph"
            autoComplete="username"
          />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input h-11 w-full border-white/15 bg-white/[0.04] text-sm focus:border-silver/60 focus:outline-none"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={busy} className="btn-silver mt-7 w-full">
          {busy ? 'Checking…' : 'Enter the back office'} {!busy && <ArrowRight size={14} />}
        </button>
        <Link to="/" className="mt-5 block text-center text-xs text-zinc-500 underline underline-offset-4 hover:text-zinc-300">
          Back to storefront
        </Link>
      </motion.form>
    </div>
  )
}
