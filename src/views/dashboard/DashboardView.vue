<template>
  <div class="agenda">
    <div class="agenda-topbar">
      <div class="month-nav">
        <span class="month-label">{{ monthLabel }}</span>
        <button class="btn-nav" @click="prevMonth">‹</button>
        <button class="btn-nav" @click="nextMonth">›</button>
      </div>

      <div class="filters">
        <select v-model="filters.employeeId" class="filter-select">
          <option value="">Todos los empleados</option>
          <option v-for="emp in employees" :key="emp.employeeId" :value="emp.employeeId">{{ emp.name }}</option>
        </select>
        <select v-model="filters.serviceId" class="filter-select">
          <option value="">Todos los servicios</option>
          <option v-for="s in services" :key="s.serviceId" :value="s.serviceId">{{ s.name }}</option>
        </select>
        <select v-model="filters.status" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="NO_SHOW">No asistió</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="empty-message">Cargando agenda...</div>

    <div v-else class="month-grid">
      <div class="weekday-row">
        <span v-for="wd in weekdayLabels" :key="wd" class="weekday-cell">{{ wd }}</span>
      </div>

      <div class="days-grid">
        <div
          v-for="(day, idx) in gridDays"
          :key="idx"
          class="day-cell"
          :class="{
            'day-cell--outside': !day.isSame(monthStart, 'month'),
            'day-cell--today': day.isSame(today, 'day'),
          }"
        >
          <div class="day-number">{{ day.date() }}</div>

          <div
            v-for="appt in visibleAppointments(idx)"
            :key="appt.appointmentId"
            class="chip"
            :style="{ borderColor: statusColor(appt.status) }"
            @click="selectedAppointment = appt"
          >
            <span class="dot" :style="{ background: statusColor(appt.status) }"></span>
            {{ formatTime(appt.startAt) }} {{ appt.customerName || 'Sin nombre' }}
          </div>

          <button v-if="hiddenCount(idx) > 0" class="btn-more" @click="toggleExpand(idx)">
            {{ expanded.has(idx) ? 'Ver menos' : `+${hiddenCount(idx)} más` }}
          </button>
        </div>
      </div>
    </div>

    <AppointmentDetailModal
      v-if="selectedAppointment"
      :appointment="selectedAppointment"
      @close="selectedAppointment = null"
      @updated="onUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import dayjs from 'dayjs'
import { businessAppointmentService } from '@/api/businessAppointments'
import { employeeService } from '@/api/employee'
import { serviceService } from '@/api/services'
import AppointmentDetailModal from '@/components/agenda/AppointmentDetailModal.vue'

const today = dayjs()
const monthStart = ref(today.startOf('month'))
const appointments = ref([])
const employees = ref([])
const services = ref([])
const loading = ref(false)
const selectedAppointment = ref(null)
const expanded = ref(new Set())

const filters = reactive({ employeeId: '', serviceId: '', status: '' })

const weekdayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function mondayOf(date) {
  const isoDay = date.day() === 0 ? 7 : date.day()
  return date.subtract(isoDay - 1, 'day').startOf('day')
}

/** gridDays — Todos los días a mostrar: desde el lunes de la 1ª semana
 *  hasta el domingo de la última semana que toca el mes actual */
const gridDays = computed(() => {
  const firstCell = mondayOf(monthStart.value)
  const monthEnd = monthStart.value.endOf('month')
  const lastCell = mondayOf(monthEnd).add(6, 'day')
  const days = []
  let cursor = firstCell
  while (cursor.isBefore(lastCell) || cursor.isSame(lastCell, 'day')) {
    days.push(cursor)
    cursor = cursor.add(1, 'day')
  }
  return days
})

const monthLabel = computed(() => monthStart.value.format('MMMM YYYY'))

function appointmentsForDay(idx) {
  const day = gridDays.value[idx]
  return appointments.value
    .filter((a) => dayjs(a.startAt).isSame(day, 'day'))
    .sort((a, b) => dayjs(a.startAt).diff(dayjs(b.startAt)))
}
function visibleAppointments(idx) {
  const all = appointmentsForDay(idx)
  return expanded.value.has(idx) ? all : all.slice(0, 2)
}
function hiddenCount(idx) {
  return Math.max(0, appointmentsForDay(idx).length - 2)
}
function toggleExpand(idx) {
  expanded.value.has(idx) ? expanded.value.delete(idx) : expanded.value.add(idx)
  expanded.value = new Set(expanded.value)
}

function statusColor(status) {
  return {
    PENDING: '#D9A441',
    CONFIRMED: 'var(--neon)',
    COMPLETED: 'var(--acero-4)',
    CANCELLED: 'var(--color-error)',
    NO_SHOW: 'var(--color-error)',
  }[status] || 'var(--color-border)'
}
function formatTime(dateStr) {
  return dayjs(dateStr).format('h:mm A')
}

async function loadAgenda() {
  loading.value = true
  try {
    const days = gridDays.value
    appointments.value = await businessAppointmentService.getAgenda({
      startDate: days[0].format('YYYY-MM-DD'),
      endDate: days[days.length - 1].format('YYYY-MM-DD'),
      employeeId: filters.employeeId || undefined,
      serviceId: filters.serviceId || undefined,
      status: filters.status || undefined,
    })
  } catch (err) {
    appointments.value = []
  } finally {
    loading.value = false
  }
}

function prevMonth() {
  monthStart.value = monthStart.value.subtract(1, 'month')
  expanded.value = new Set()
  loadAgenda()
}
function nextMonth() {
  monthStart.value = monthStart.value.add(1, 'month')
  expanded.value = new Set()
  loadAgenda()
}

function onUpdated(updated) {
  const i = appointments.value.findIndex((a) => a.appointmentId === updated.appointmentId)
  if (i !== -1) appointments.value[i] = updated
}

watch(() => [filters.employeeId, filters.serviceId, filters.status], loadAgenda)

onMounted(async () => {
  loadAgenda()
  try {
    employees.value = await employeeService.getEmployees()
  } catch (err) { employees.value = [] }
  try {
    const data = await serviceService.list()
    services.value = Array.isArray(data) ? data : data?.services || []
  } catch (err) { services.value = [] }
})
</script>

<style scoped>
.agenda { padding: 20px; }
.agenda-topbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.month-nav { display: flex; align-items: center; gap: 10px; }
.month-label { color: var(--color-text); font-size: 0.95rem; font-weight: 500; text-transform: capitalize; }
.btn-nav {
  background: var(--color-surface-alt); border: 1px solid var(--color-border); color: var(--color-text-label);
  width: 30px; height: 30px; border-radius: 8px; cursor: pointer; font-size: 1rem;
}
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-select {
  background: var(--color-surface-alt); border: 1px solid var(--color-border); color: var(--color-text);
  border-radius: 8px; padding: 7px 10px; font-size: 0.82rem;
}

.month-grid { border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; }
.weekday-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); background: var(--color-surface-alt); }
.weekday-cell { padding: 8px; text-align: center; font-size: 0.75rem; color: var(--color-text-muted); }

.days-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 1px; background: var(--color-surface-alt); }
.day-cell { background: var(--color-bg); min-height: 110px; padding: 6px; }
.day-cell--outside { opacity: 0.35; }
.day-number { color: var(--color-text-muted); font-size: 0.78rem; margin-bottom: 4px; }
.day-cell--today .day-number { color: var(--neon); font-weight: 600; }

.chip {
  display: flex; align-items: center; gap: 4px;
  background: var(--color-surface); border: 1px solid var(--color-border); border-left: 3px solid;
  border-radius: 5px; padding: 3px 6px; margin-bottom: 3px; cursor: pointer;
  font-size: 0.7rem; color: var(--color-text-label); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

.btn-more { background: none; border: none; color: var(--neon); font-size: 0.68rem; cursor: pointer; padding: 1px 0; }
.empty-message { color: var(--color-text-muted); text-align: center; padding: 40px 0; }

@media (max-width: 640px) {
  .day-cell { min-height: 70px; padding: 4px; }
  .weekday-cell { font-size: 0.65rem; padding: 6px 2px; }
  .chip { font-size: 0.62rem; }
}
</style>