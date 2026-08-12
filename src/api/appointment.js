/**
 * appointment.js — Servicio de llamadas HTTP de citas (lado cliente)
 * ======================================================
 * Endpoint público /appointments (sin prefijo /business).
 * ======================================================
 */

import { request } from './http'

export const appointmentService = {
  /** create — Crea una cita (invitado o cliente autenticado) */
  create(payload, options = {}) {
    return request('/appointments/', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: options.skipAuth,
    })
  },

  /** getAutofill - Datos del cliente autenticado para reservar */
  getAutofill() {
    return request('/appointments/autofill', { method: 'GET' })
  },

  /** getHistory - Historial de citas del cliente autenticado */
  getHistory({ page = 0, size = 10, sort = 'startAt,desc' } = {}) {
    const params = new URLSearchParams({ page, size, sort })
    return request(`/appointments/history?${params.toString()}`, { method: 'GET' })
  },

  /** getRecentBusinesses - Negocios donde el cliente ha agendado citas */
  getRecentBusinesses() {
    return request('/appointments/recent-businesses', { method: 'GET' })
  },

  /** cancel - Cancela una cita propia del cliente */
  cancel(appointmentId) {
    return request(`/appointments/cancel/${appointmentId}`, { method: 'POST' })
  },
}
