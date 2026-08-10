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

  const fetchAgenda = async () => {
    loading.value = true
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
      loading.value = false
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

  return { appointments, loading, error, filters, fetchAgenda, setFilters, replaceAppointment }
})
