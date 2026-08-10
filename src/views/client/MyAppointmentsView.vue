<template>
  <div class="work-page">
    <header class="work-header">
      <h1>Mis citas</h1>
      <button class="btn btn-outline-light" @click="load">Actualizar</button>
    </header>

    <div v-if="loading" class="state">Cargando citas...</div>
    <div v-else-if="error" class="state state-error">{{ error }}</div>
    <div v-else-if="appointments.length === 0" class="state">Aun no tienes citas registradas.</div>

    <div v-else class="stack">
      <AppointmentListItem
        v-for="appointment in appointments"
        :key="appointment.appointmentId"
        :appointment="appointment"
        :busy="busyId === appointment.appointmentId"
        @cancel="cancelAppointment"
        @reviewed="load"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { appointmentService } from '@/api/appointment'
import AppointmentListItem from '@/components/client/AppointmentListItem.vue'

const appointments = ref([])
const loading = ref(false)
const error = ref('')
const busyId = ref(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const page = await appointmentService.getHistory({ size: 50 })
    appointments.value = page?.content || []
  } catch (err) {
    error.value = err.message || 'No se pudo cargar el historial'
  } finally {
    loading.value = false
  }
}

async function cancelAppointment(appointment) {
  busyId.value = appointment.appointmentId
  error.value = ''
  try {
    const updated = await appointmentService.cancel(appointment.appointmentId)
    appointments.value = appointments.value.map((item) =>
      item.appointmentId === updated.appointmentId ? updated : item
    )
  } catch (err) {
    error.value = err.message || 'No se pudo cancelar la cita'
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.work-page { background: var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 28px; }
.work-header { align-items: center; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.work-header h1 { font-size: 1.5rem; margin: 0; }
.stack { display: flex; flex-direction: column; gap: 10px; }
.state { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); padding: 18px; }
.state-error { color: var(--color-error); }
</style>
