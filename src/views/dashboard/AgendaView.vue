<template>
  <div class="work-page">
    <div class="work-inner">
      <header class="work-header">
        <div>
          <span class="eyebrow">Calendario operativo</span>
          <h1>Calendario</h1>
        </div>
        <div class="header-actions">
          <button class="toolbar-button" @click="applyFilters">Actualizar</button>
          <button class="toolbar-button toolbar-button--primary" :disabled="loadingBooking" @click="openBooking">
            {{ loadingBooking ? 'Cargando...' : 'Nueva cita' }}
          </button>
        </div>
      </header>

      <div class="calendar-toolbar">
        <div class="toolbar-month">
          <button class="toolbar-nav" type="button" aria-label="Mes anterior" @click="shiftMonth(-1)">‹</button>
          <strong class="toolbar-month-title">{{ monthLabel }}</strong>
          <button class="toolbar-nav" type="button" aria-label="Mes siguiente" @click="shiftMonth(1)">›</button>
        </div>

        <div class="toolbar-filters">
          <select v-model="filters.employeeId" class="toolbar-select" aria-label="Filtrar por empleado" @change="applyFilters">
            <option value="">Todos los empleados</option>
            <option v-for="employee in employees" :key="employee.employeeId" :value="employee.employeeId">
              {{ employee.name }}
            </option>
          </select>

          <select v-model="filters.serviceId" class="toolbar-select" aria-label="Filtrar por servicio" @change="applyFilters">
            <option value="">Todos los servicios</option>
            <option v-for="service in servicesStore.services" :key="service.serviceId || service.id" :value="service.serviceId || service.id">
              {{ service.name }}
            </option>
          </select>

          <select v-model="filters.status" class="toolbar-select" aria-label="Filtrar por estado" @change="applyFilters">
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="COMPLETED">Completada</option>
            <option value="NO_SHOW">No asistio</option>
          </select>
        </div>
      </div>

      <div v-if="agenda.loading" class="state">Cargando agenda...</div>
      <div v-else-if="agenda.error" class="state state-error">{{ friendlyError }}</div>
      <div v-else-if="agenda.appointments.length === 0" class="calendar-note">No hay citas en este rango. Prueba cambiando de mes o quitando filtros.</div>

      <section class="calendar-panel">
        <MonthCalendar :appointments="agenda.appointments" :month="currentMonth" @select="selected = $event" />
      </section>
    </div>

    <AppointmentDetailModal
      v-if="selected"
      :appointment="selected"
      @close="selected = null"
      @updated="handleUpdated"
    />
    <BookingModal
      v-if="bookingBusiness"
      v-model="showCreate"
      :business="bookingBusiness"
      :internal="true"
      @booked="handleCreated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useAgendaStore } from '@/stores/agenda'
import { useServicesStore } from '@/stores/services'
import { useBusinessStore } from '@/stores/business'
import { useAuthStore } from '@/stores/auth'
import { employeeService } from '@/api/employee'
import { publicBusinessService } from '@/api/publicBusiness'
import MonthCalendar from '@/components/agenda/MonthCalendar.vue'
import AppointmentDetailModal from '@/components/agenda/AppointmentDetailModal.vue'
import BookingModal from '@/components/booking/BookingModal.vue'

const agenda = useAgendaStore()
const servicesStore = useServicesStore()
const businessStore = useBusinessStore()
const authStore = useAuthStore()

const employees = ref([])
const selected = ref(null)
const showCreate = ref(false)
const bookingBusiness = ref(null)
const loadingBooking = ref(false)
const currentMonth = ref(dayjs().format('YYYY-MM'))
const filters = reactive({ employeeId: '', serviceId: '', status: '' })
const businessId = computed(() => businessStore.business?.businessId || null)
const isOwner = computed(() => authStore.isBusiness && businessStore.hasBusiness)
const myEmployeeId = computed(() => businessStore.employees[0]?.employeeId || null)

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const monthLabel = computed(() => {
  const d = dayjs(currentMonth.value)
  return `${MONTHS[d.month()]} ${d.year()}`
})

const friendlyError = computed(() => {
  if (agenda.error.includes('403')) return 'No tienes permiso para consultar esta agenda con la sesion actual.'
  return agenda.error
})

function applyFilters() {
  agenda.setFilters({
    startDate: dayjs(currentMonth.value).startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs(currentMonth.value).endOf('month').format('YYYY-MM-DD'),
    ...filters,
  })
}

function shiftMonth(delta) {
  currentMonth.value = dayjs(currentMonth.value).add(delta, 'month').format('YYYY-MM')
  applyFilters()
}

function handleUpdated(updated) {
  agenda.replaceAppointment(updated)
  selected.value = null
}

async function handleCreated() {
  showCreate.value = false
  await agenda.fetchAgenda()
}

/** openBooking — Carga los datos públicos del negocio y abre el modal de reserva */
async function openBooking() {
  if (bookingBusiness.value) {
    showCreate.value = true
    return
  }
  loadingBooking.value = true
  try {
    const slug = authStore.user?.slug
    if (!slug) throw new Error('No hay un negocio asociado a tu cuenta')
    const data = await publicBusinessService.getBySlug(slug)
    if (!isOwner.value && myEmployeeId.value) {
      data.employees = (data.employees || []).filter((emp) => emp.employeeId === myEmployeeId.value)
    }
    bookingBusiness.value = data
    showCreate.value = true
  } catch (e) {
    alert(e?.message || 'No se pudo cargar el negocio para agendar citas.')
  } finally {
    loadingBooking.value = false
  }
}

/** loadEmployees — Lista de empleados del filtro; si no es dueño, cae a su propio registro */
async function loadEmployees() {
  try {
    const list = await employeeService.getEmployees()
    employees.value = list || []
  } catch {
    try {
      const me = await employeeService.getMyEmployee()
      employees.value = me ? [me] : []
    } catch {
      employees.value = []
    }
  }
}

onMounted(async () => {
  await Promise.all([
    businessStore.fetched ? Promise.resolve() : businessStore.fetchStatus().catch(() => {}),
    servicesStore.fetched ? Promise.resolve() : servicesStore.fetchAll().catch(() => {}),
    loadEmployees(),
  ])
  applyFilters()
})
</script>

<style scoped>
.work-page { background: radial-gradient(circle at top left, rgba(63, 225, 255, 0.05), transparent 34%), var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 28px 32px; }
.work-inner { margin: 0 auto; max-width: 1280px; }

.work-header { align-items: center; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.eyebrow { color: var(--neon); display: block; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.work-header h1 { font-size: 1.65rem; line-height: 1.1; margin: 4px 0 0; }
.header-actions { display: flex; gap: 10px; }

.calendar-toolbar { align-items: center; display: flex; flex-wrap: wrap; gap: 14px; justify-content: space-between; margin-bottom: 16px; }
.toolbar-month { align-items: center; display: flex; gap: 10px; }
.toolbar-month-title { color: var(--color-text); font-size: 1.2rem; font-weight: 800; min-width: 150px; }
.toolbar-nav {
  background: #1e3d49;
  border: 1px solid rgba(63, 106, 120, 0.5);
  border-radius: 8px;
  color: #d5f0f7;
  cursor: pointer;
  font-size: 1.1rem;
  height: 36px;
  line-height: 1;
  width: 36px;
  transition: background 0.15s, border-color 0.15s;
}
.toolbar-nav:hover { background: #10252c; border-color: rgba(63, 225, 255, 0.5); color: var(--neon); }

.toolbar-filters { display: flex; flex-wrap: wrap; gap: 10px; }
.toolbar-select {
  appearance: none;
  background-color: #3f6a78;
  background-image: linear-gradient(45deg, transparent 50%, rgba(255, 255, 255, 0.8) 50%), linear-gradient(135deg, rgba(255, 255, 255, 0.8) 50%, transparent 50%);
  background-position: calc(100% - 16px) 16px, calc(100% - 11px) 16px;
  background-repeat: no-repeat;
  background-size: 5px 5px, 5px 5px;
  border: 1px solid rgba(213, 240, 247, 0.14);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 600;
  height: 38px;
  min-width: 0;
  padding: 0 34px 0 13px;
  transition: background-color 0.15s, border-color 0.15s;
}
.toolbar-select:hover { background-color: #10252c; border-color: rgba(63, 225, 255, 0.45); }
.toolbar-select:focus { border-color: var(--neon); outline: none; }
.toolbar-select option { background: #10252c; color: #d5f0f7; }

.toolbar-button {
  background: transparent;
  border: 1px solid rgba(213, 240, 247, 0.38);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.86rem;
  font-weight: 700;
  height: 38px;
  padding: 0 16px;
  transition: border-color 0.15s, color 0.15s;
}
.toolbar-button:hover { border-color: var(--neon); color: var(--neon); }
.toolbar-button--primary {
  background: var(--neon);
  border-color: var(--neon);
  color: #081013;
}
.toolbar-button--primary:hover { filter: brightness(1.05); color: #081013; }

.calendar-panel { border-radius: 12px; }
.calendar-note { background: rgba(16, 37, 44, 0.72); border: 1px solid rgba(63, 225, 255, 0.12); border-radius: 8px; color: rgba(213, 240, 247, 0.6); font-size: 0.88rem; margin-bottom: 16px; padding: 14px; }
.state { background: rgba(16, 37, 44, 0.72); border: 1px solid rgba(63, 225, 255, 0.12); border-radius: 8px; color: rgba(213, 240, 247, 0.68); margin-bottom: 16px; padding: 18px; }
.state-error { border-color: rgba(255, 107, 107, 0.3); color: #ff8585; }

@media (max-width: 920px) {
  .calendar-toolbar { align-items: flex-start; flex-direction: column; }
  .toolbar-filters { width: 100%; }
  .toolbar-select { flex: 1 1 160px; }
}
@media (max-width: 560px) {
  .work-page { padding: 20px 14px; }
  .work-header { align-items: flex-start; flex-direction: column; }
}
</style>