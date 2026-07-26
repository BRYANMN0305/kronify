/**
 * auth.js — Servicio de llamadas HTTP para autenticación
 * ======================================================
 * Usa fetch nativo y añade automáticamente el token JWT
 * en el header Authorization cuando el usuario está logueado.
 * ======================================================
 */

import { useAuthStore } from '@/stores/auth'

// URL base de la API, configurable via .env
const BASE_URL = import.meta.env.VITE_API_URL || ''

/**
 * request — Petición HTTP genérica con autenticación
 * @param {string}  endpoint  — ruta relativa (ej. /api/auth/login)
 * @param {object}  options   — opciones de fetch (method, body, headers...)
 * @returns {Promise<object>} — respuesta JSON
 */
async function request(endpoint, options = {}) {
  const store = useAuthStore()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  // Si hay token, lo añade al header Authorization
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

/** authService — Métodos de autenticación */
export const authService = {
  /** login — Inicia sesión */
  login(credenciales) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credenciales),
    })
  },

  /** register — Registra un nuevo usuario */
  register(payload) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
