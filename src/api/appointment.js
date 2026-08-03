/**
 * appointment.js — Servicio de llamadas HTTP de citas (lado cliente)
 * ======================================================
 * Endpoint público /appointments (sin prefijo /business).
 * ======================================================
 */

import { request } from './http'

export const appointmentService = {
  /** create — Crea una cita (invitado o cliente autenticado) */
  create(payload) {
    return request('/appointments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}