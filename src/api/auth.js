/**
 * auth.js — Servicio de llamadas HTTP para autenticación
 * ======================================================
 * Usa fetch nativo (request de ./http) que añade
 * automáticamente el token JWT en el header Authorization.
 * ======================================================
 */

import { request } from './http'

/** authService — Métodos de autenticación */
export const authService = {
  /** login — Inicia sesión */
  login(credenciales) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credenciales),
    })
  },

  /** register — Registra un nuevo usuario */
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /** setOAuthProfile — Asigna el tipo de perfil tras el primer login por OAuth */
  setOAuthProfile(profileType) {
    return request('/auth/oauth/profile', {
      method: 'POST',
      body: JSON.stringify({ profileType }),
    })
  },
}
