<template>
  <div class="work-page">
    <div class="work-inner">
      <header class="work-header">
        <div>
          <span class="eyebrow">Calendario operativo</span>
          <h1>Agenda</h1>
          <p>Consulta, filtra y gestiona las citas del negocio.</p>
        </div>
        <button class="refresh-button" @click="agenda.fetchAgenda()">Actualizar</button>
      </header>

      <section class="summary-grid" aria-label="Resumen de agenda">
        <div class="summary-card">
          <span>Total</span>
          <strong>{{ agenda.appointments.length }}</strong>
        </div>
        <div class="summary-card">
          <span>Pendientes</span>
          <strong>{{ countByStatus('PENDING') }}</strong>
        </div>
        <div class="summary-card">
          <span>Confirmadas</span>
          <strong>{{ countByStatus('CONFIRMED') }}</strong>
        </div>
        <div class="summary-card">
          <span>Completadas</span>
          <strong>{{ countByStatus('COMPLETED') }}</strong>
        </div>
      </section>

      <AgendaFilters
        :filters="agenda.filters"
        :employees="employees"
        :services="servicesStore.services"
        @apply="agenda.setFilters"
      />

      <section class="agenda-panel">
        <div v-if="agenda.loading" class="state">Cargando agenda...</div>
        <div v-else-if="agenda.error" class="state state-error">{{ friendlyError }}</div>
        <div v-else-if="agenda.appointments.length === 0" class="state">
          <strong>No hay citas para este rango</strong>
          <span>Prueba ampliando las fechas o quitando algun filtro.</span>
        </div>
        <AgendaCalendar v-else :appointments="agenda.appointments" @select="selected = $event" />
      </section>
    </div>

    <AppointmentDetailModal
      v-if="selected"
      :appointment="selected"
      @close="selected = null"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { computed } from 'vue'
import { useAgendaStore } from '@/stores/agenda'
import { useServicesStore } from '@/stores/services'
import { employeeService } from '@/api/employee'
import AgendaFilters from '@/components/agenda/AgendaFilters.vue'
import AgendaCalendar from '@/components/agenda/AgendaCalendar.vue'
import AppointmentDetailModal from '@/components/agenda/AppointmentDetailModal.vue'

const agenda = useAgendaStore()
const servicesStore = useServicesStore()
const employees = ref([])
const selected = ref(null)

const friendlyError = computed(() => {
  if (agenda.error.includes('403')) return 'No tienes permiso para consultar esta agenda con la sesion actual.'
  return agenda.error
})

function countByStatus(status) {
  return agenda.appointments.filter((appointment) => appointment.status === status).length
}

function handleUpdated(updated) {
  agenda.replaceAppointment(updated)
  selected.value = null
}

onMounted(async () => {
  await Promise.all([
    agenda.fetchAgenda(),
    servicesStore.fetched ? Promise.resolve() : servicesStore.fetchAll().catch(() => {}),
    employeeService.getEmployees().then((data) => { employees.value = data || [] }).catch(() => {}),
  ])
})
</script>

<style scoped>
.work-page { background: radial-gradient(circle at top left, rgba(63, 225, 255, 0.06), transparent 34%), var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 28px 32px; }
.work-inner { margin: 0 auto; max-width: 1280px; }
.work-header { align-items: flex-start; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.eyebrow { color: var(--neon); font-size: 0.72rem; font-weight: 800; text-transform: uppercase; }
.work-header h1 { font-size: 1.65rem; line-height: 1.1; margin: 4px 0 6px; }
.work-header p { color: rgba(213, 240, 247, 0.58); margin: 0; }
.refresh-button { background: transparent; border: 1px solid rgba(213, 240, 247, 0.38); border-radius: 7px; color: var(--color-text); font-weight: 700; min-height: 40px; padding: 0 16px; }
.refresh-button:hover { border-color: var(--neon); color: var(--neon); }
.summary-grid { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 14px; }
.summary-card { background: rgba(16, 37, 44, 0.58); border: 1px solid rgba(213, 240, 247, 0.09); border-radius: 8px; padding: 13px 14px; }
.summary-card span { color: rgba(213, 240, 247, 0.58); display: block; font-size: 0.76rem; font-weight: 700; margin-bottom: 5px; }
.summary-card strong { color: var(--color-text); font-size: 1.45rem; line-height: 1; }
.agenda-panel { background: rgba(6, 13, 16, 0.28); border: 1px solid rgba(213, 240, 247, 0.08); border-radius: 8px; min-height: 360px; padding: 14px; }
.state { align-items: flex-start; background: rgba(16, 37, 44, 0.72); border: 1px solid rgba(63, 225, 255, 0.12); border-radius: 8px; color: rgba(213, 240, 247, 0.68); display: flex; flex-direction: column; gap: 4px; padding: 18px; }
.state strong { color: var(--color-text); }
.state-error { border-color: rgba(255, 107, 107, 0.3); color: #ff8585; }
@media (max-width: 920px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .work-page { padding: 20px 14px; } .work-header { flex-direction: column; } .summary-grid { grid-template-columns: 1fr; } }
</style>
