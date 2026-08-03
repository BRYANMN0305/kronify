import { request } from './http'

export const publicBusinessService = {
  /** getBySlug — Obtiene la info pública del negocio (servicios y empleados incluidos) */
  getBySlug(slug) {
    return request(`/public/businesses/${slug}`, { method: 'GET' })
  },

  /** getAvailability — Obtiene los horarios disponibles de un servicio en una fecha */
  getAvailability(slugOrId, serviceId, date, employeeId) {
    const params = new URLSearchParams({ serviceId, date })
    if (employeeId) params.set('employeeId', employeeId)
    return request(`/public/businesses/${slugOrId}/availability?${params.toString()}`, { method: 'GET' })
  },
}