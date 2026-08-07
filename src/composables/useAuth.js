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
 * Mapa de proveedores del frontend a los registrationId del backend:
 * microsoft → "azure" (id del registro OAuth2 configurado en application.yml)
 */
const OAUTH_REGISTRATION_IDS = { google: 'google', microsoft: 'azure' }

/**
 * resumePendingInvitation — Si el usuario venía de un link de invitación,
 * redirige a la página de aceptación para procesar el token.
 * @returns {string|null} token guardado, si existe
 */
const resumePendingInvitation = (router) => {
  const token = sessionStorage.getItem('inviteToken')
  if (!token) return null
  sessionStorage.removeItem('inviteToken')
  router.replace({ path: '/invitacion/aceptar', query: { token } })
  return token
}

/**
 * useAuth — Hook de autenticación
 * @returns {{ login, register, loginWithOAuth, finalizeOAuthLogin, completeOAuthProfile, oauthRedirecting, loading, error }}
 */
export const useAuth = () => {
  const router = useRouter()
  const store = useAuthStore()
  const loading = ref(false)        // indica si hay una petición en curso
  const error = ref(null)          // último error ocurrido
  const oauthRedirecting = ref(false) // indica si estamos redirigiendo al proveedor OAuth

  /**
   * login — Inicia sesión con email y contraseña
   * @param {{ email: string, password: string }} credenciales
   */
  const login = async (credenciales) => {
    loading.value = true
    error.value = null
    try {
      const { accessToken } = await authService.login(credenciales)
      store.setAuth({ token: accessToken })
      if (!resumePendingInvitation(router)) router.push('/calendario')
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /** register — Registra al usuario, guarda el token y redirige */
  const register = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const { accessToken } = await authService.register(payload)
      store.setAuth({ token: accessToken })

      if (!resumePendingInvitation(router)) {
        if (payload.profileType === 'BUSINESS') {
          const businessStore = useBusinessStore()
          await businessStore.fetchStatus()
        }

        router.push('/calendario')
      }
    } catch (e) {
      error.value = e?.response?.data?.message || e.message || 'Registration failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  /**
   * loginWithOAuth — Redirige al proveedor OAuth para autenticación
   * El backend redirige de vuelta a /oauth/callback con el JWT propio.
   * @param {'google'|'microsoft'} proveedor
   */
  const loginWithOAuth = (proveedor) => {
    const registrationId = OAUTH_REGISTRATION_IDS[proveedor] || proveedor
    const baseUrl = import.meta.env.VITE_API_URL || ''
    oauthRedirecting.value = true
    window.location.href = `${baseUrl}/oauth2/authorization/${registrationId}`
  }

  /**
   * finalizeOAuthLogin — Aplica el token recibido en el callback OAuth:
   * guarda la sesión y redirige al destino correspondiente.
   * @param {string} token — JWT devuelto por el backend en el callback
   */
  const finalizeOAuthLogin = (token) => {
    store.setAuth({ token })
    if (!resumePendingInvitation(router)) router.replace('/calendario')
  }

  /**
   * completeOAuthProfile — Guarda el tipo de perfil elegido en el
   * primer login OAuth y aplica el token actualizado.
   * @param {'CLIENT'|'BUSINESS'} profileType
   */
  const completeOAuthProfile = async (profileType) => {
    const { accessToken } = await authService.setOAuthProfile(profileType)
    store.setAuth({ token: accessToken })
    if (!resumePendingInvitation(router)) router.replace('/calendario')
  }

  return {
    login,
    register,
    loginWithOAuth,
    finalizeOAuthLogin,
    completeOAuthProfile,
    oauthRedirecting,
    loading,
    error,
  }
}
