<template>
  <div class="work-page">
    <div class="work-inner">
      <header class="work-header">
        <div>
          <span class="eyebrow">Tu calendario</span>
          <h1>Calendario</h1>
        </div>
        
      </header>

      <div class="calendar-toolbar">
        <div class="toolbar-month">
          <button class="toolbar-nav" type="button" aria-label="Mes anterior" @click="shiftMonth(-1)">‹</button>
          <strong class="toolbar-month-title">{{ monthLabel }}</strong>
          <button class="toolbar-nav" type="button" aria-label="Mes siguiente" @click="shiftMonth(1)">›</button>
        </div>
      </div>

      <div v-if="loading" class="state">Cargando tus citas...</div>
      <div v-else-if="error" class="state state-error">{{ error }}</div>
      <div v-else-if="appointmentsInMonth.length === 0" class="calendar-note">
        No tienes citas agendadas este mes.
      </div>

      <section class="calendar-panel">
        <MonthCalendar :appointments="appointmentsInMonth" :month="currentMonth" @select="selected = $event" />
      </section>
    </div>

    <div v-if="selected" class="overlay" @click.self="selected = null">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ selected.serviceName }}</h3>
          <button class="btn-icon" @click="selected = null">×</button>
        </div>
        <div class="modal-body">
          <div class="row"><span class="label">Profesional</span><span>{{ selected.employeeName }}</span></div>
          <div class="row"><span class="label">Fecha</span><span>{{ formatDate(selected.startAt) }}</span></div>
          <div class="row"><span class="label">Duración</span><span>{{ selected.serviceDurationMinutes }} min</span></div>
          <div class="row"><span class="label">Estado</span><span>{{ statusLabel(selected.status) }}</span></div>

          <p v-if="cancelError" class="error-message">{{ cancelError }}</p>

          <button
            v-if="canCancel(selected)"
            class="btn-primary"
            :disabled="cancelling"
            @click="doCancel"
          >
            {{ cancelling ? 'Cancelando...' : 'Cancelar cita' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { appointmentService } from '@/api/appointment'
import MonthCalendar from '@/components/agenda/MonthCalendar.vue'

const appointments = ref([])
const loading = ref(false)
const error = ref('')
const selected = ref(null)
const cancelling = ref(false)
const cancelError = ref('')
const currentMonth = ref(dayjs().format('YYYY-MM'))

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const monthLabel = computed(() => {
  const d = dayjs(currentMonth.value)
  return `${MONTHS[d.month()]} ${d.year()}`
})

// Filtra en el front las citas del mes visible (el historial ya viene ordenado por fecha)
const appointmentsInMonth = computed(() => {
  const start = dayjs(currentMonth.value).startOf('month')
  const end = dayjs(currentMonth.value).endOf('month')
  return appointments.value.filter((ap) => {
    const d = dayjs(ap.startAt)
    return !d.isBefore(start) && !d.isAfter(end)
  })
})

function shiftMonth(delta) {
  currentMonth.value = dayjs(currentMonth.value).add(delta, 'month').format('YYYY-MM')
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    // Endpoint propio del cliente: no requiere negocio asociado al usuario
    const page = await appointmentService.getHistory({ page: 0, size: 200, sort: 'startAt,asc' })
    appointments.value = page?.content || []
  } catch (err) {
    error.value = err.message || 'No se pudo cargar tu calendario'
  } finally {
    loading.value = false
  }
}

function canCancel(ap) {
  return ap.status === 'PENDING' || ap.status === 'CONFIRMED'
}

async function doCancel() {
  if (!selected.value) return
  cancelling.value = true
  cancelError.value = ''
  try {
    const updated = await appointmentService.cancel(selected.value.appointmentId)
    appointments.value = appointments.value.map((item) =>
      item.appointmentId === updated.appointmentId ? updated : item
    )
    selected.value = updated
  } catch (err) {
    cancelError.value = err.message || 'No se pudo cancelar la cita'
  } finally {
    cancelling.value = false
  }
}

function formatDate(date) {
  return dayjs(date).format('DD MMM YYYY, HH:mm')
}

function statusLabel(status) {
  const map = {
    PENDING: 'Pendiente', CONFIRMED: 'Confirmada', COMPLETED: 'Completada',
    CANCELLED: 'Cancelada', NO_SHOW: 'No asistió',
  }
  return map[status] || status
}

onMounted(load)
</script>

<style scoped>
.work-page { background: radial-gradient(circle at top left, rgba(63, 225, 255, 0.05), transparent 34%), var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 28px 32px; }
.work-inner { margin: 0 auto; max-width: 1280px; }
.work-header { align-items: center; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.eyebrow { color: var(--neon); display: block; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.work-header h1 { font-size: 1.65rem; line-height: 1.1; margin: 4px 0 0; }
.calendar-toolbar { align-items: center; display: flex; flex-wrap: wrap; gap: 14px; justify-content: space-between; margin-bottom: 16px; }
.toolbar-month { align-items: center; display: flex; gap: 10px; }
.toolbar-month-title { color: var(--color-text); font-size: 1.2rem; font-weight: 800; min-width: 150px; }
.toolbar-nav { background: #1e3d49; border: 1px solid rgba(63, 106, 120, 0.5); border-radius: 8px; color: #d5f0f7; cursor: pointer; font-size: 1.1rem; height: 36px; line-height: 1; width: 36px; }
.toolbar-nav:hover { background: #10252c; border-color: rgba(63, 225, 255, 0.5); color: var(--neon); }
.toolbar-button { background: transparent; border: 1px solid rgba(213, 240, 247, 0.38); border-radius: 8px; color: var(--color-text); cursor: pointer; font-size: 0.86rem; font-weight: 700; height: 38px; padding: 0 16px; }
.toolbar-button:hover { border-color: var(--neon); color: var(--neon); }
.calendar-panel { border-radius: 12px; }
.calendar-note, .state { background: rgba(16, 37, 44, 0.72); border: 1px solid rgba(63, 225, 255, 0.12); border-radius: 8px; color: rgba(213, 240, 247, 0.68); margin-bottom: 16px; padding: 14px; }
.state-error { border-color: rgba(255, 107, 107, 0.3); color: #ff8585; }

.overlay { align-items: center; background: rgba(6, 13, 16, 0.72); display: flex; inset: 0; justify-content: center; position: fixed; z-index: 50; }
.modal { background: #10252c; border: 1px solid rgba(63, 225, 255, 0.18); border-radius: 12px; max-width: 420px; padding: 20px; width: 90%; }
.modal-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 14px; }
.modal-title { font-size: 1.1rem; margin: 0; }
.btn-icon { background: none; border: none; color: #d5f0f7; cursor: pointer; font-size: 1.3rem; }
.row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.label { color: rgba(213, 240, 247, 0.6); }
.btn-primary { background: var(--neon); border: none; border-radius: 8px; color: #081013; cursor: pointer; font-weight: 700; height: 40px; margin-top: 10px; width: 100%; }
.btn-primary:disabled { opacity: 0.6; }
.error-message { color: #ff8585; font-size: 0.85rem; }

@media (max-width: 560px) {
  .work-page { padding: 20px 14px; }
  .work-header { align-items: flex-start; flex-direction: column; }
}
</style>