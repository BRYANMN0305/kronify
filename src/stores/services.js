/**
 * services.js — Estado global de los servicios del negocio
 * ==========================================================
 * Centraliza la lista de servicios y las operaciones CRUD.
 * Después de cada mutación se refresca la lista desde el servidor
 * para que el estado nunca se desincronice con el backend.
 * ==========================================================
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { serviceService } from '@/api/services'

export const useServicesStore = defineStore('services', () => {
  const services = ref([])
  const loading = ref(false)
  const error = ref('')
  const fetched = ref(false)

  /** fetchAll — Carga la lista de servicios del negocio */
  const fetchAll = async () => {
    loading.value = true
    error.value = ''
    try {
      const data = await serviceService.list()
      services.value = Array.isArray(data) ? data : data?.services || []
      fetched.value = true
    } catch (e) {
      error.value = e.message || 'Error al cargar los servicios'
    } finally {
      loading.value = false
    }
  }

  /** create — Crea un servicio y refresca la lista */
  const create = async (payload) => {
    error.value = ''
    try {
      await serviceService.create(payload)
      await fetchAll()
    } catch (e) {
      error.value = e.message || 'Error al crear el servicio'
      throw e
    }
  }

  /** update — Actualiza un servicio y refresca la lista */
  const update = async (serviceId, payload) => {
    error.value = ''
    try {
      await serviceService.update(serviceId, payload)
      await fetchAll()
    } catch (e) {
      error.value = e.message || 'Error al actualizar el servicio'
      throw e
    }
  }

  /** remove — Elimina (soft delete) un servicio y refresca la lista */
  const remove = async (serviceId) => {
    error.value = ''
    try {
      await serviceService.remove(serviceId)
      await fetchAll()
    } catch (e) {
      error.value = e.message || 'Error al eliminar el servicio'
      throw e
    }
  }

  /** reset — Limpia el estado al cambiar de sesión */
  const reset = () => {
    services.value = []
    loading.value = false
    error.value = ''
    fetched.value = false
  }

  return {
    services, loading, error, fetched,
    fetchAll, create, update, remove, reset,
  }
})
