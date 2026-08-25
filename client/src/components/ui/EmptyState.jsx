export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-20 text-center">
      <span className="font-display text-5xl text-stroke-faint tracking-widest">EMPTY</span>
      <p className="font-display text-xl uppercase tracking-wide">{title}</p>
      {subtitle && <p className="max-w-md text-sm text-zinc-500">{subtitle}</p>}
      {action}
    </div>
  )
}
