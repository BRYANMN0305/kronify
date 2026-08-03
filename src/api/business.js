/**
 * business.js — Servicio de llamadas HTTP del negocio
 * ======================================================
 * Usa fetch nativo (request de ./http) con token JWT.
 * ======================================================
 */

import { request } from './http'

/** businessService — Métodos del negocio */
export const businessService = {
  /** getMe — Obtiene el negocio del usuario (null si no tiene) */
  async getMe() {
    try {
      return await request('/business/me', { method: 'GET' })
    } catch (err) {
      if (err.status === 404) return null
      throw err
    }
  },

  /** create — Crea el negocio */
  create(payload) {
    return request('/business/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /** update — Actualiza los datos del negocio */
  update(payload) {
    return request('/business/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  /** toggleOwnerAsEmployee — Activa/desactiva el dueño como empleado */
  toggleOwnerAsEmployee(enabled) {
    return request('/business/employees/owner/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    })
  },

  /** getEmployees — Lista los empleados del negocio (incluye al dueño si es empleado) */
  getEmployees() {
    return request('/business/employees/', { method: 'GET' })
  },

  /** uploadImage — Sube el logo del negocio */
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request('/upload', { method: 'POST', body: formData })
  },
}
