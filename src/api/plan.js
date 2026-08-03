/**
 * plan.js — Servicio de llamadas HTTP del plan del negocio
 * ======================================================
 * Usa fetch nativo (request de ./http) con token JWT.
 * ======================================================
 */

import { request } from './http'

/** planService — Métodos del plan del negocio */
export const planService = {
  /** getCurrent — Obtiene el plan actual del negocio */
  getCurrent() {
    return request('/business/plan', { method: 'GET' })
  },

  /** change — Cambia o activa el plan del negocio */
  change(planId, activationCode) {
    return request('/business/plan', {
      method: 'POST',
      body: JSON.stringify({ planId, activationCode }),
    })
  },

  /** getHistory — Obtiene el historial de planes del negocio */
  getHistory() {
    return request('/business/plan/history', { method: 'GET' })
  },

  /** getAvailable — Obtiene el catálogo de planes disponibles (público) */
  getAvailable() {
    return request('/public/plans', { method: 'GET' })
  },
}
