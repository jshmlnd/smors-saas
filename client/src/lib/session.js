const KEY = 'smors-session-id'

export function getSessionId() {
  let id = null
  try {
    id = localStorage.getItem(KEY)
  } catch {
    /* noop */
  }
  if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    id = crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    try {
      localStorage.setItem(KEY, id)
    } catch {
      /* noop */
    }
  }
  return id
}
