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
  } catch {
    // ignore
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

export { api, getToken }
export default api
