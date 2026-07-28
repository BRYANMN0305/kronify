/**
 * useAuth.js — Composable de autenticación
 * ======================================================
 * Centraliza la lógica de login, registro y OAuth.
 * Depende de:
 *   - Pinia store (useAuthStore) para el estado
 *   - authService (api/auth.js) para peticiones HTTP
 *   - Vue Router para redirigir después de autenticar
 * ======================================================
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { authService } from '@/api/auth'

/**
 * useAuth — Hook de autenticación
 * @returns {{ login, register, loginWithOAuth, loading, error }}
 */
export function useAuth() {
  const router = useRouter()
  const store = useAuthStore()
  const loading = ref(false)   // indica si hay una petición en curso
  const error = ref(null)      // último error ocurrido

  /**
   * login — Inicia sesión con email y contraseña
   * @param {{ email: string, password: string }} credenciales
   */
  async function login(credenciales) {
    loading.value = true
    error.value = null
    try {
      const { accessToken } = await authService.login(credenciales)
      store.setAuth({ token: accessToken })
      router.push('/dashboard')
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /** register — Registra al usuario, guarda el token y redirige */
  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const { accessToken } = await authService.register(payload)
      store.setAuth({ token: accessToken })

      if (payload.profileType === 'BUSINESS') {
        const businessStore = useBusinessStore()
        await businessStore.fetchStatus()
      }

      router.push('/dashboard')
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Registration failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  /**
   * loginWithOAuth — Redirige al proveedor OAuth para autenticación
   * @param {'google'|'microsoft'} proveedor
   */
  function loginWithOAuth(proveedor) {
    const baseUrl = import.meta.env.VITE_API_URL || ''
    window.location.href = `${baseUrl}/api/auth/${proveedor}`
  }

  return { login, register, loginWithOAuth, loading, error }
}
