import type { WebStorage } from 'redux-persist/lib/types'

/**
 * Hand-rolled storage engine instead of `redux-persist/lib/storage`: that
 * package reads `window.localStorage` at module-import time, which throws
 * during TanStack Start's Node SSR pass. This defers the `window` check to
 * call time and no-ops on the server.
 */
export const storage: WebStorage = {
  getItem(key) {
    if (typeof window === 'undefined') return Promise.resolve(null)
    return Promise.resolve(window.localStorage.getItem(key))
  },
  setItem(key, value) {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
    return Promise.resolve()
  },
  removeItem(key) {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key)
    return Promise.resolve()
  },
}
