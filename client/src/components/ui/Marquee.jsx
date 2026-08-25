import { cn } from '../../lib/format.js'

export default function Marquee({ items = [], className = '', speed = '36s', outline = false }) {
  return (
    <div className={cn('relative overflow-hidden py-3', className)}>
      <div className="marquee-track" style={{ animationDuration: speed }}>
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {items.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center whitespace-nowrap">
                <span
                  className={cn(
                    'font-display uppercase tracking-wide text-lg md:text-xl px-6',
                    outline ? 'text-stroke-faint' : 'text-zinc-100'
                  )}
                >
                  {item}
                </span>
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-silver/70" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
