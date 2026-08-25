import { useState } from 'react'
import { cn } from '../../lib/format.js'

const CATEGORY_LABELS = {
  tees: 'TEE',
  shirts: 'SHIRT',
  shorts: 'SHORTS',
  pants: 'PANTS',
  shoes: 'KICKS',
  hoodies: 'HOODIE',
  jackets: 'JACKET'
}

export default function SmartImage({ src, alt, category = '', className = '', imgClassName = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-silver/60 select-none',
          className
        )}
      >
        <span className="font-display text-4xl tracking-widest opacity-70">SMORS</span>
        {category && (
          <span className="text-[0.65rem] tracking-[0.35em] uppercase text-zinc-500">
            {CATEGORY_LABELS[category] || category}
          </span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', imgClassName || className)}
    />
  )
}
