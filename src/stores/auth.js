import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** decodeJwt — Extrae el payload de un JWT sin verificar firma (solo lectura) */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = decodeURIComponent(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
            .split('')
            .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  /** setAuth — Guarda el token y deriva el usuario de sus claims */
  function setAuth({ token: t }) {
    token.value = t
    user.value = decodeJwt(t)
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const profileType = computed(() => user.value?.profileType ?? null)
  const isBusiness = computed(() => profileType.value === 'BUSINESS')

  return { token, user, isAuthenticated, profileType, isBusiness, setAuth, logout }
})