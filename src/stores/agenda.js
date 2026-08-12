import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { businessAppointmentService } from '@/api/businessAppointments'

export const useAgendaStore = defineStore('agenda', () => {
  const appointments = ref([])
  const loading = ref(false)
  const error = ref('')
  const filters = ref({
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    employeeId: '',
    serviceId: '',
    status: '',
    origin: '',
  })

  const fetchAgenda = async (opts = {}) => {
    const { silent = false } = opts
    if (!silent) loading.value = true
    error.value = ''
    try {
      const payload = Object.fromEntries(
        Object.entries(filters.value).filter(([, value]) => value !== '' && value !== null)
      )
      appointments.value = await businessAppointmentService.getAgenda(payload)
    } catch (err) {
      error.value = err.message || 'No se pudo cargar la agenda'
      appointments.value = []
    } finally {
      if (!silent) loading.value = false
    }
  }

  const setFilters = (nextFilters) => {
    filters.value = { ...filters.value, ...nextFilters }
    return fetchAgenda()
  }

  const replaceAppointment = (updated) => {
    appointments.value = appointments.value.map((item) =>
      item.appointmentId === updated.appointmentId ? updated : item
    )
  }

  /** upsertAppointment — Inserta o reemplaza una cita y la deja ordenada por fecha */
  const upsertAppointment = (updated) => {
    const idx = appointments.value.findIndex((item) => item.appointmentId === updated.appointmentId)
    if (idx >= 0) {
      appointments.value[idx] = updated
    } else {
      appointments.value.push(updated)
    }
    appointments.value.sort((a, b) => (a.startAt < b.startAt ? -1 : a.startAt > b.startAt ? 1 : 0))
  }

  /** matchesFilters — Indica si una cita entra en los filtros actuales de la agenda */
  const matchesFilters = (appointment) => {
    const day = String(appointment.startAt || '').slice(0, 10)
    if (filters.value.startDate && day < filters.value.startDate) return false
    if (filters.value.endDate && day > filters.value.endDate) return false
    if (filters.value.employeeId && String(appointment.employeeId) !== String(filters.value.employeeId)) return false
    if (filters.value.serviceId && String(appointment.serviceId) !== String(filters.value.serviceId)) return false
    if (filters.value.status && String(appointment.status) !== String(filters.value.status)) return false
    return true
  }

  return { appointments, loading, error, filters, fetchAgenda, setFilters, replaceAppointment, upsertAppointment, matchesFilters }
})
