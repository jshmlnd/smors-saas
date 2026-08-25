import api from './api.js'
import { getSessionId } from './session.js'
import { useCartStore } from '../store/cartStore.js'
import { useWishlistStore } from '../store/wishlistStore.js'
import { useOrderHistoryStore } from '../store/orderHistoryStore.js'

const PUSH_DEBOUNCE_MS = 800

let started = false
let applyingRemote = false
let pushTimer = null

function buildMergedCart(remoteCart) {
  const local = useCartStore.getState().items
  const byKey = new Map(local.map((i) => [i.key, i]))
  for (const item of Array.isArray(remoteCart) ? remoteCart : []) {
    if (!item?.key || byKey.has(item.key)) continue
    byKey.set(item.key, { ...item })
  }
  return [...byKey.values()]
}

function applyRemote(session) {
  applyingRemote = true
  try {
    const cart = buildMergedCart(session.cart)
    useCartStore.getState().clear()
    cart.forEach((item) => useCartStore.setState((s) => ({ items: [...s.items, item] })))

    const localWishlist = useWishlistStore.getState().ids
    const merged = [...new Set([...localWishlist, ...(session.wishlist || [])])]
    merged.forEach((id) => {
      if (!localWishlist.includes(id)) useWishlistStore.getState().toggle(id)
    })

    const localOrders = useOrderHistoryStore.getState().orders
    const byRef = new Map(localOrders.map((o) => [o.ref, o]))
    for (const o of session.orders || []) {
      if (o?.ref && !byRef.has(o.ref)) byRef.set(o.ref, o)
    }
    const orders = [...byRef.values()]
      .sort((a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0))
      .slice(0, 50)
    useOrderHistoryStore.setState({ orders })
  } finally {
    applyingRemote = false
  }
}

function snapshot() {
  return {
    cart: useCartStore.getState().items,
    wishlist: useWishlistStore.getState().ids,
    orders: useOrderHistoryStore.getState().orders
  }
}

function schedulePush() {
  if (applyingRemote) return
  clearTimeout(pushTimer)
  pushTimer = setTimeout(async () => {
    try {
      await api.put(`/session/${getSessionId()}`, snapshot())
    } catch {
      /* offline or server down — local state still works */
    }
  }, PUSH_DEBOUNCE_MS)
}

export function initSessionSync() {
  if (started) return
  started = true

  const sid = getSessionId()

  useCartStore.subscribe(schedulePush)
  useWishlistStore.subscribe(schedulePush)
  useOrderHistoryStore.subscribe(schedulePush)

  ;(async () => {
    try {
      const res = await api.get(`/session/${sid}`)
      applyRemote(res.data || {})
      await api.put(`/session/${sid}`, snapshot())
    } catch {
      /* first visit or offline — nothing to restore */
    }
  })()
}
