import { create } from 'zustand'

let toastId = 0

export const useUiStore = create()((set, get) => ({
  toasts: [],
  toast: (message, type = 'default') => {
    const id = ++toastId
    set({ toasts: [...get().toasts, { id, message, type }] })
    setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2800)
  }
}))
