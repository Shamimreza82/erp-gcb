import axios from "axios"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("auth-storage")
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.state?.token) return parsed.state.token
    }
    const legacy = localStorage.getItem("token")
    if (legacy) return legacy
  } catch (e) {
    console.error("[axios] Failed to read auth token:", e)
  }
  return null
}

const api = axios.create()

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "unknown"
    const status = err.response?.status || "NETWORK"
    const message = err.response?.data?.error || err.message || "Unknown error"
    console.error(`[API] ${status} ${url}: ${message}`)
    return Promise.reject(err)
  }
)

export { api, getToken }
export default api
