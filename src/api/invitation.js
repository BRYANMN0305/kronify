/**
 * invitation.js — Servicio de llamadas HTTP de invitaciones
 * ======================================================
 * Usa fetch nativo (request de ./http) con token JWT.
 * ======================================================
 */

import { request } from './http'

/** invitationService — Métodos de invitaciones */
export const invitationService = {
  /** getAll — Obtiene las invitaciones del negocio */
  getAll() {
    return request('/business/invitations/', { method: 'GET' })
  },

  /** create — Crea una invitación a un empleado */
  create(email) {
    return request('/business/invitations/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  /** resend — Reenvía una invitación pendiente */
  resend(invitationId) {
    return request(`/business/invitations/${invitationId}/resend`, { method: 'POST' })
  },

  /** cancel — Cancela una invitación pendiente */
  cancel(invitationId) {
    return request(`/business/invitations/${invitationId}/cancel`, { method: 'POST' })
  },
}
