/**
 * auth.js — Pinia store de autenticación
 * ======================================================
 * Almacena el token JWT y los datos del usuario.
 * Persiste en localStorage para mantener la sesión.
 * ======================================================
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * useAuthStore — Store de autenticación
 *
 * State:
 *   token {string|null}  — JWT del usuario
 *   user  {object|null}  — datos del usuario
 *
 * Getters:
 *   isAuthenticated {boolean} — true si hay token
 *
 * Actions:
 *   setAuth({ token, user }) — guarda credenciales
 *   logout()                 — elimina sesión
 */
export const useAuthStore = defineStore('auth', () => {

  // ---- State: se inicializa desde localStorage ----
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // ---- Getter: indica si el usuario está autenticado ----
  const isAuthenticated = computed(() => !!token.value)

  // ---- Actions ----

  /** setAuth — Persiste token y usuario en state + localStorage */
  function setAuth({ token: t, user: u }) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  /** logout — Elimina la sesión del state y localStorage */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthenticated, setAuth, logout }
})
