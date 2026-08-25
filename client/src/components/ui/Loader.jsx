export default function Loader({ label = 'LOADING' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4" role="status" aria-label={label}>
      <span className="relative inline-flex h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-white/10" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-silver animate-spin" />
      </span>
      <span className="text-[0.7rem] tracking-[0.3em] text-zinc-500">{label}</span>
    </div>
  )
}
