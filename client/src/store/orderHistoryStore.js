import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOrderHistoryStore = create()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        const ref = String(order?.ref || '').toUpperCase().trim()
        if (!ref) return
        const entry = {
          ref,
          total: Number(order?.total) || 0,
          status: order?.status || 'payment_review',
          placedAt: order?.placedAt || new Date().toISOString()
        }
        set({ orders: [entry, ...get().orders.filter((o) => o.ref !== ref)].slice(0, 50) })
      },
      setStatus: (ref, status) =>
        set({
          orders: get().orders.map((o) => (o.ref === ref ? { ...o, status } : o))
        })
    }),
    { name: 'smors-orders' }
  )
)
