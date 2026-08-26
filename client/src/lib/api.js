import axios from 'axios'
import { getSessionId } from './session.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000
})

api.interceptors.request.use((config) => {
  try {
    config.headers['X-Session-Id'] = getSessionId()
    const raw = localStorage.getItem('smors-admin')
    const token = raw ? JSON.parse(raw)?.state?.token : null
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    /* noop */
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    const ct = String(res.headers?.['content-type'] || '')
    if ((ct.includes('text/html') || (typeof res.data === 'string' && res.data.trimStart().startsWith('<')))) {
      const err = new Error('API returned HTML — backend not reachable at this origin')
      err.friendly = 'Server unavailable — please try again later'
      err.isBadGateway = true
      return Promise.reject(err)
    }
    return res
  },
  (err) => {
    const status = err.response?.status
    if (status === 401) {
      localStorage.removeItem('smors-admin')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.assign('/admin/login')
      }
    }
    err.friendly = err.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(err)
  }
)

export default api
