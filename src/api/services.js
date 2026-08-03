/**
 * services.js — Servicio de llamadas HTTP de los servicios del negocio
 * ======================================================================
 * Usa fetch nativo (request de ./http) con token JWT.
 * Endpoints: /business/services/
 * ======================================================================
 */

import { request } from './http'

/** serviceService — Métodos de los servicios del negocio */
export const serviceService = {
  /** list — Obtiene todos los servicios del negocio */
  list: () => request('/business/services/', { method: 'GET' }),

  /** get — Obtiene un servicio por id */
  get: (serviceId) => request(`/business/services/${serviceId}`, { method: 'GET' }),

  /** create — Crea un servicio */
  create: (payload) =>
    request('/business/services/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** update — Actualiza un servicio (PATCH con cuerpo completo) */
  update: (serviceId, payload) =>
    request(`/business/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  /** remove — Elimina un servicio (204 No Content) */
  remove: (serviceId) => request(`/business/services/${serviceId}`, { method: 'DELETE' }),
}
