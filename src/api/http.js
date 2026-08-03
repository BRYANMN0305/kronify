/**
 * http.js — Cliente HTTP compartido para todos los servicios
 * ======================================================
 * fetch nativo con token JWT del localStorage.
 * Si el backend responde 401 (token inválido/expirado),
 * limpia la sesión y redirige al login.
 * ======================================================
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''

/** handleUnauthorized — Limpia la sesión y redirige al login */
const handleUnauthorized = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}

/**
 * request — Petición HTTP genérica con autenticación
 * @param {string}  endpoint  — ruta relativa (ej. /user/profile)
 * @param {object}  options   — opciones de fetch (method, body, headers...)
 * @returns {Promise<object>} — respuesta JSON
 */
export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  const isFormData = options.body instanceof FormData
  const headers = {
    ...options.headers,
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  // Token inválido o expirado: cerrar sesión y volver al login
  // (solo si ya había sesión; un 401 del propio login es credenciales incorrectas)
  if (res.status === 401) {
    if (token) {
      handleUnauthorized()
      const err = new Error('Tu sesión expiró. Inicia sesión nuevamente.')
      err.status = 401
      throw err
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    const err = new Error(body.message || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }

  // 204 No Content (p. ej. DELETE): no hay cuerpo que parsear
  if (res.status === 204) return null

  return res.json().catch(() => null)
}
