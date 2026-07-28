import { useAuthStore } from '@/stores/auth'

const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(endpoint, options = {}) {
  const store = useAuthStore()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (store.token) {
    headers['Authorization'] = `Bearer ${store.token}`
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const employeeService = {
  getMine() {
    return request('/employees/mine', { method: 'GET' })
  },
}
