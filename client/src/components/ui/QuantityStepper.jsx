import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, onChange, min = 1, max = 99, small = false }) {
  const btn = `grid place-items-center ${small ? 'h-7 w-7' : 'h-10 w-10'} rounded-full border border-white/12 text-zinc-300 transition hover:border-silver hover:text-white disabled:opacity-30`
  return (
    <div className={`inline-flex items-center gap-1 ${small ? 'text-sm' : ''}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus size={14} />
      </button>
      <span className={`${small ? 'w-8' : 'w-10'} text-center font-semibold tabular-nums`}>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
