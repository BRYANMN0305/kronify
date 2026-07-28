import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(endpoint, options = {}) {
  const store = useAuthStore()
  const isFormData = options.body instanceof FormData
  const headers = {
    ...options.headers,
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (store.token) {
    headers['Authorization'] = `Bearer ${store.token}`
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    if (res.status === 404) return null
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const businessService = {
  getMe() {
    return request('/business/me', { method: 'GET' })
  },

  create(payload) {
    return request('/business/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request('/upload', { method: 'POST', body: formData })
  },
}
