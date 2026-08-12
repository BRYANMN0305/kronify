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

    <ClientAppointmentDetailModal
      v-if="selected"
      :appointment="selected"
      @close="selected = null"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { appointmentService } from '@/api/appointment'
import MonthCalendar from '@/components/agenda/MonthCalendar.vue'
import ClientAppointmentDetailModal from '@/components/client/ClientAppointmentDetailModal.vue'

const appointments = ref([])
const loading = ref(false)
const error = ref('')
const selected = ref(null)
const currentMonth = ref(dayjs().format('YYYY-MM'))

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const monthLabel = computed(() => {
  const d = dayjs(currentMonth.value)
  return `${MONTHS[d.month()]} ${d.year()}`
})

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
    const page = await appointmentService.getHistory({ page: 0, size: 200, sort: 'startAt,asc' })
    appointments.value = page?.content || []
  } catch (err) {
    error.value = err.message || 'No se pudo cargar tu calendario'
  } finally {
    loading.value = false
  }
}

function handleUpdated(updated) {
  appointments.value = appointments.value.map((item) =>
    item.appointmentId === updated.appointmentId ? updated : item
  )
  selected.value = updated
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
.calendar-panel { border-radius: 12px; }
.calendar-note, .state { background: rgba(16, 37, 44, 0.72); border: 1px solid rgba(63, 225, 255, 0.12); border-radius: 8px; color: rgba(213, 240, 247, 0.68); margin-bottom: 16px; padding: 14px; }
.state-error { border-color: rgba(255, 107, 107, 0.3); color: #ff8585; }

@media (max-width: 560px) {
  .work-page { padding: 20px 14px; }
  .work-header { align-items: flex-start; flex-direction: column; }
}
</style>