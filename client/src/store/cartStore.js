import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, size, qty = 1) => {
        const key = `${product._id}__${size || 'os'}`
        const items = [...get().items]
        const idx = items.findIndex((i) => i.key === key)
        if (idx >= 0) {
          items[idx] = {
            ...items[idx],
            qty: Math.min(items[idx].qty + qty, items[idx].stock)
          }
        } else {
          items.push({
            key,
            productId: product._id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            image: product.images?.[0] || '',
            price: product.price,
            size: size || '',
            stock: product.stock,
            qty: Math.min(qty, product.stock)
          })
        }
        set({ items })
      },
      setQty: (key, qty) =>
        set({
          items: get()
            .items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) } : i))
        }),
      remove: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.qty * i.price, 0)
    }),
    { name: 'smors-cart' }
  )
)
