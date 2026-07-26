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
      const { token, user } = await authService.login(credenciales)
      store.setAuth({ token, user })
      router.push('/dashboard')
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * register — Registra un nuevo usuario
   * @param {{ name, lastName, phoneNumber, email, passwordHash, profileType }} payload
   */
  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const { token, user } = await authService.register(payload)
      store.setAuth({ token, user })
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
