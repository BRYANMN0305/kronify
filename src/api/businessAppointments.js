/**
 * businessAppointments.js — Servicio de llamadas HTTP de citas (lado negocio)
 * ==============================================================================
 * Endpoints: /business/appointments/
 * ==============================================================================
 */

import { request } from './http'

export const businessAppointmentService = {
  /** list - Lista paginada de citas del negocio */
  list({ page = 0, size = 20, sort = 'startAt,desc' } = {}) {
    const params = new URLSearchParams({ page, size, sort })
    return request(`/business/appointments/?${params.toString()}`, { method: 'GET' })
  },

  /** getAgenda — Citas en un rango de fechas, con filtros opcionales */
  getAgenda({ startDate, endDate, employeeId, serviceId, status, origin }) {
    const params = new URLSearchParams({ startDate, endDate })
    if (employeeId) params.set('employeeId', employeeId)
    if (serviceId) params.set('serviceId', serviceId)
    if (status) params.set('status', status)
    if (origin) params.set('origin', origin)
    return request(`/business/appointments/agenda?${params.toString()}`, { method: 'GET' })
  },

  /** getById — Detalle de una cita */
  getById(appointmentId) {
    return request(`/business/appointments/${appointmentId}`, { method: 'GET' })
  },

  /** updateStatus — Cambia el estado de una cita */
  updateStatus(appointmentId, payload) {
    return request(`/business/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  /** reschedule — Reagenda una cita a una nueva fecha/hora */
  reschedule(appointmentId, payload) {
    return request(`/business/appointments/${appointmentId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
