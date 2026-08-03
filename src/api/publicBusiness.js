import { request } from './http'

export const publicBusinessService = {
  /** getBySlug — Obtiene la info pública del negocio (servicios y empleados incluidos) */
  getBySlug(slug) {
    return request(`/public/businesses/${slug}`, { method: 'GET' })
  },
}