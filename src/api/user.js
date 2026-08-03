/**
 * user.js — Servicio de llamadas HTTP del usuario autenticado
 * ======================================================
 * Usa fetch nativo (request de ./http) con token JWT.
 * ======================================================
 */

import { request } from './http'

/** userService — Métodos del perfil del usuario autenticado */
export const userService = {
  /** getProfile — Obtiene la configuración actual del usuario */
  getProfile() {
    return request('/user/profile', { method: 'GET' })
  },

  /** updateProfile — Actualiza los datos personales del usuario */
  updateProfile(payload) {
    return request('/user/update', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  /** updatePassword — Cambia la contraseña actual del usuario */
  updatePassword(payload) {
    return request('/users/updatedPassword', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  /** getAuthMethods — Lista los métodos de autenticación del usuario */
  getAuthMethods() {
    return request('/user/auth-methods', { method: 'GET' })
  },
}
