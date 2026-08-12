<template>
  <div v-if="modelValue" class="booking-overlay" @click.self="close">
    <div class="booking-modal">
      <div class="booking-header">
        <button v-if="step > 1 && step < 5" class="btn-icon" @click="back">←</button>
        <div class="header-text">
          <h2 class="booking-title">{{ stepTitle }}</h2>
        </div>
        <button class="btn-icon" @click="close">×</button>
      </div>

      <div class="booking-body">
        <!-- Paso 1: Servicio -->
        <div v-if="step === 1" class="step-list">
          <button
            v-for="service in business.services"
            :key="service.serviceId"
            class="option-row"
            @click="selectService(service)"
          >
            <div>
              <div class="option-name">{{ service.name }}</div>
              <div class="option-meta">{{ service.durationMinutes }} min</div>
            </div>
            <span v-if="service.price" class="option-price">${{ service.price.toLocaleString() }}</span>
          </button>
        </div>

        <!-- Paso 2: Empleado -->
        <div v-else-if="step === 2" class="step-list">
          <button class="option-row" @click="selectEmployee(null)">
            <div class="option-name">Cualquiera disponible</div>
          </button>
          <button
            v-for="emp in employeesForService"
            :key="emp.employeeId"
            class="option-row"
            @click="selectEmployee(emp.employeeId)"
          >
            <div class="option-name">{{ emp.name }}</div>
          </button>
        </div>

        <!-- Paso 3: Fecha y horarios -->
        <div v-else-if="step === 3" class="step-datetime">
          <div class="datetime-layout">
            <!-- Calendario -->
            <div class="calendar-panel">
              <div class="calendar-header">
                <button class="calendar-nav" @click="prevMonth">‹</button>
                <span class="calendar-title">{{ monthName }} {{ calendarYear }}</span>
                <button class="calendar-nav" @click="nextMonth">›</button>
              </div>
              <div class="calendar-grid">
                <div v-for="d in weekDays" :key="d" class="calendar-weekday">{{ d }}</div>
                <div
                  v-for="(day, idx) in calendarDays"
                  :key="idx"
                  class="calendar-day"
                  :class="{
                    'calendar-day--empty': !day.date,
                    'calendar-day--past': day.past,
                    'calendar-day--selected': day.selected,
                    'calendar-day--today': day.isToday,
                  }"
                  @click="day.date && !day.past && selectDate(day)"
                >
                  {{ day.date || '' }}
                </div>
              </div>
            </div>

            <!-- Horarios -->
            <div class="slots-panel">
              <div v-if="loadingSlots" class="empty-message">Cargando horarios...</div>
              <div v-else-if="availabilityError" class="empty-message">{{ availabilityError }}</div>
              <div v-else-if="!dateSelected" class="empty-message">Selecciona un día</div>
              <div v-else-if="slots.length === 0" class="empty-message">Sin horarios</div>
              <div v-else class="slots-list">
                <button
                  v-for="(slot, idx) in visibleSlots"
                  :key="idx"
                  class="slot-btn"
                  :class="{ 'slot-btn--selected': selectedSlot?.startAt === slot.startAt }"
                  @click="selectSlot(slot)"
                >
                  {{ formatTime(slot.startAt) }}
                  <span v-if="!selectedEmployeeId" class="slot-employee">
                    <template v-if="slot.multiple">{{ slot.count }} profesionales</template>
                    <template v-else>{{ slot.employeeName }}</template>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Paso 4: Datos del cliente -->
        <div v-else-if="step === 4" class="step-form">
          <section class="settings-section">
            <div class="settings-section-header">
              <div>
                <h3 class="settings-section-title">Resumen de tu cita</h3>
              </div>
            </div>
            <div class="booking-summary">
              <div>
                <div class="settings-data-label">Cita</div>
                <div class="settings-data-value">{{ selectedService.name }}</div>
              </div>
              <div>
                <div class="settings-data-label">Hora</div>
                <div class="settings-data-value">{{ formatDate(selectedSlot.startAt) }}</div>
              </div>
              <div>
                <div class="settings-data-label">Profesional</div>
                <div class="settings-data-value booking-employee">{{ selectedSlot.employeeName }}</div>
              </div>
            </div>
          </section>

          <form class="settings-section settings-form" novalidate @submit.prevent="submit">
            <div class="settings-section-header">
              <div>
                <h3 v-if="internal" class="settings-section-title">Datos del cliente</h3>
                <h3 v-else class="settings-section-title">Tus datos</h3>
                <p v-if="internal" class="settings-section-subtitle">¿Cómo contactamos al cliente?</p>
                <p v-else class="settings-section-subtitle">¿Cómo te contactamos?</p>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Nombre <span class="required-mark">*</span></label>
                <input v-model="form.customerName" class="form-control" placeholder="Tu nombre" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Apellido</label>
                <input v-model="form.customerLastName" class="form-control" placeholder="Tu apellido" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Teléfono <span class="required-mark">*</span></label>
                <input v-model="form.customerPhone" class="form-control" placeholder="Tu teléfono" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input v-model="form.customerEmail" type="email" class="form-control" placeholder="Tu email" />
              </div>
            </div>

            <div v-if="submitError" class="settings-alert settings-alert-error">{{ submitError }}</div>

            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ submitting ? 'Confirmando...' : 'Confirmar cita' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Paso 5: Confirmación -->
        <div v-else class="step-confirm">
          <div class="confirm-icon">✓</div>
          <p v-if="internal" class="confirm-title">¡Cita confirmada!</p>
          <p v-else class="confirm-title">¡Cita programada!</p>
          <p v-if="internal" class="confirm-text">
            La cita para {{ form.customerName }} el {{ formatDate(selectedSlot.startAt) }} quedó confirmada.
          </p>
          <p v-else class="confirm-text">
            Tu cita del {{ formatDate(selectedSlot.startAt) }} está pendiente de confirmación por el empleado.
          </p>
          <button class="btn-confirm" @click="close">Listo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { publicBusinessService } from '@/api/publicBusiness'
import { appointmentService } from '@/api/appointment'
import { businessAppointmentService } from '@/api/businessAppointments'

const CO = -300

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  business: { type: Object, required: true },
  initialService: { type: Object, default: null },
  /** internal — true cuando se agenda desde el panel del negocio (dueño/empleado) */
  internal: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'booked'])

const step = ref(1)
const selectedService = ref(null)
const selectedEmployeeId = ref(null)
const selectedDate = ref(dayjs().utcOffset(CO).format('YYYY-MM-DD'))
const slots = ref([])
const loadingSlots = ref(false)
const availabilityError = ref(null)
const selectedSlot = ref(null)
const submitting = ref(false)
const submitError = ref(null)

const form = ref({
  customerName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
})

const today = dayjs().utcOffset(CO).format('YYYY-MM-DD')
const nowCO = () => dayjs().utcOffset(CO)
const currentUser = computed(() => JSON.parse(localStorage.getItem('user') || 'null'))
const isClientSession = computed(() => currentUser.value?.profileType === 'CLIENT')

const employeesForService = computed(() => {
  if (!selectedService.value) return []
  return (props.business.employees || []).filter((emp) =>
    emp.serviceIds.includes(selectedService.value.serviceId)
  )
})

const selectedEmployeeName = computed(() => {
  if (!selectedEmployeeId.value) return 'Cualquiera disponible'
  const emp = (props.business.employees || []).find(e => e.employeeId === selectedEmployeeId.value)
  return emp?.name || ''
})

const headerEmployeeName = computed(() => {
  if (selectedSlot.value) return selectedSlot.value.employeeName
  return selectedEmployeeName.value
})

const stepTitle = computed(() => {
  switch (step.value) {
    case 1: return 'Elige un servicio'
    case 2: return 'Elige un profesional'
    case 3: return 'Elige fecha y hora'
    case 4: return 'Tus datos'
    default: return '¡Listo!'
  }
})

const calendarMonth = ref(nowCO().month())
const calendarYear = ref(nowCO().year())

const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

const monthName = computed(() => {
  return nowCO().month(calendarMonth.value).year(calendarYear.value).format('MMMM')
})

const calendarDays = computed(() => {
  const first = dayjs().year(calendarYear.value).month(calendarMonth.value).date(1)
  const startOffset = first.day()
  const daysInMonth = first.daysInMonth()
  const todayStr = nowCO().format('YYYY-MM-DD')
  const days = []
  for (let i = 0; i < startOffset; i++) days.push({ date: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const raw = dayjs().year(calendarYear.value).month(calendarMonth.value).date(d)
    const dateStr = raw.format('YYYY-MM-DD')
    days.push({
      date: d,
      raw,
      dateStr,
      past: raw.isBefore(nowCO(), 'day'),
      selected: dateStr === selectedDate.value,
      isToday: dateStr === todayStr,
    })
  }
  return days
})

const dateSelected = computed(() => !!selectedDate.value)

const visibleSlots = computed(() => {
  if (selectedEmployeeId.value) return slots.value
  const groups = new Map()
  for (const slot of slots.value) {
    const g = groups.get(slot.startAt) || {
      startAt: slot.startAt,
      employeeIds: [],
      employeeNames: [],
      count: 0,
    }
    g.employeeIds.push(slot.employeeId)
    g.employeeNames.push(slot.employeeName)
    g.count++
    groups.set(slot.startAt, g)
  }
  return Array.from(groups.values()).map((g) => ({
    startAt: g.startAt,
    count: g.count,
    multiple: g.count > 1,
    employeeId: g.employeeIds[0],
    employeeName: g.employeeNames[0],
    employeeIds: g.employeeIds,
    employeeNames: g.employeeNames,
  }))
})

function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

function selectDate(day) {
  selectedDate.value = day.dateStr
  loadAvailability()
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    selectedService.value = props.initialService || null
    selectedEmployeeId.value = null
    selectedDate.value = nowCO().format('YYYY-MM-DD')
    calendarMonth.value = nowCO().month()
    calendarYear.value = nowCO().year()
    slots.value = []
    selectedSlot.value = null
    availabilityError.value = null
    submitError.value = null
    form.value = { customerName: '', customerLastName: '', customerPhone: '', customerEmail: '' }
    step.value = selectedService.value ? 2 : 1
    await loadAutofill()
  }
)

async function loadAutofill() {
  if (!localStorage.getItem('token') || !isClientSession.value) return
  const data = await appointmentService.getAutofill()
  form.value = { customerName: data.name, customerLastName: data.lastName, customerPhone: data.phoneNumber, customerEmail: data.email }
}

function selectService(service) {
  selectedService.value = service
  step.value = 2
}

function selectEmployee(employeeId) {
  selectedEmployeeId.value = employeeId
  step.value = 3
  loadAvailability()
}

async function loadAvailability() {
  if (!selectedService.value || !selectedDate.value) return
  loadingSlots.value = true
  selectedSlot.value = null
  availabilityError.value = null
  try {
    const res = await publicBusinessService.getAvailability(
      props.business.slug,
      selectedService.value.serviceId,
      selectedDate.value,
      selectedEmployeeId.value || undefined
    )
    slots.value = res.slots || []
  } catch (err) {
    slots.value = []
    availabilityError.value = err?.message || 'No se pudieron cargar los horarios. Intenta de nuevo.'
  } finally {
    loadingSlots.value = false
  }
}

function selectSlot(slot) {
  if (slot.multiple) {
    const idx = Math.floor(Math.random() * slot.employeeIds.length)
    selectedSlot.value = {
      startAt: slot.startAt,
      employeeId: slot.employeeIds[idx],
      employeeName: slot.employeeNames[idx],
    }
  } else {
    selectedSlot.value = slot
  }
  step.value = 4
}

function back() {
  if (step.value === 2) step.value = 1
  else if (step.value === 3) step.value = 2
  else if (step.value === 4) step.value = 3
}

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  if (!form.value.customerName || !form.value.customerPhone || !form.value.customerEmail) {
    submitError.value = 'Completa nombre, telefono y email para confirmar.'
    return
  }
  submitting.value = true
  submitError.value = null
  try {
    const payload = {
      businessId: props.business.businessId,
      serviceId: selectedService.value.serviceId,
      employeeId: selectedSlot.value.employeeId,
      startAt: selectedSlot.value.startAt,
      customerName: form.value.customerName,
      customerLastName: form.value.customerLastName,
      customerPhone: form.value.customerPhone,
      customerEmail: form.value.customerEmail,
    }
    if (props.internal) {
      await businessAppointmentService.create(payload)
    } else {
      await appointmentService.create(payload, { skipAuth: !isClientSession.value })
    }
    step.value = 5
    emit('booked')
  } catch (err) {
    submitError.value = err?.message || 'No se pudo completar la cita. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}

function formatTime(dateStr) {
  return dayjs(dateStr).utcOffset(CO).format('h:mm A')
}
function formatDate(dateStr) {
  return dayjs(dateStr).utcOffset(CO).format('DD MMM YYYY, h:mm A')
}
</script>

<style scoped>
.booking-overlay {
  position: fixed; inset: 0; background: rgba(6, 13, 16, 0.75);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.booking-modal {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 16px; width: 100%; max-width: 660px; max-height: 85vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.booking-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-bottom: 1px solid var(--color-border);
}
.booking-title { color: var(--color-text); font-size: 1rem; font-weight: 600; margin: 0; }
.header-text { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.header-employee { color: var(--neon); font-size: 0.82rem; font-weight: 500; }
.btn-icon { background: none; border: none; color: var(--color-text-muted); font-size: 1.1rem; cursor: pointer; padding: 4px 8px; }
.booking-body { padding: 16px 18px; overflow: hidden; flex: 1; min-height: 0; }

.step-list { display: flex; flex-direction: column; gap: 8px; }
.option-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-surface-alt); border: 1px solid var(--color-border);
  border-radius: 10px; padding: 12px 14px; cursor: pointer; text-align: left; width: 100%;
}
.option-row:hover { border-color: var(--neon); }
.option-name { color: var(--color-text); font-size: 0.9rem; font-weight: 500; }
.option-meta { color: var(--color-text-muted); font-size: 0.78rem; margin-top: 2px; }
.option-price { color: var(--neon); font-weight: 600; font-size: 0.9rem; }

.step-datetime { padding: 0; flex: 1; display: flex; flex-direction: column; min-height: 0; }
.datetime-layout {
  display: flex; gap: 0; flex: 1; min-height: 0;
}
.calendar-panel { flex: 1; min-width: 0; padding-right: 16px; border-right: 1px solid var(--color-border); display: flex; flex-direction: column; }
.calendar-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.calendar-nav {
  background: none; border: none; color: var(--color-text-muted);
  font-size: 1.2rem; cursor: pointer; padding: 4px 8px; border-radius: 6px;
}
.calendar-nav:hover { color: var(--color-text); background: var(--color-surface-alt); }
.calendar-title { color: var(--color-text); font-size: 0.9rem; font-weight: 600; text-transform: capitalize; }
.calendar-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
}
.calendar-weekday {
  text-align: center; font-size: 0.75rem; font-weight: 600;
  color: var(--color-text-muted); padding: 6px 0; text-transform: capitalize;
}
.calendar-day {
  text-align: center; font-size: 0.8rem; color: var(--color-text);
  width: 60px; height: 60px; border-radius: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.calendar-day:hover:not(.calendar-day--empty):not(.calendar-day--past) {
  background: var(--color-surface-alt);
}
.calendar-day--empty { cursor: default; }
.calendar-day--past { color: var(--color-text-muted); opacity: 0.3; cursor: not-allowed; }
.calendar-day--selected {
  background: var(--color-text); color: var(--color-bg); font-weight: 600;
}
.calendar-day--today:not(.calendar-day--selected) {
  border: 1px solid var(--neon); color: var(--neon);
}

.slots-panel {
  width: 140px; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 6px;
  padding-left: 16px;
  overflow-y: auto;
  max-height: 440px;
  scrollbar-width: none;
}
.slots-panel::-webkit-scrollbar { display: none; }
.slots-list {
  display: flex; flex-direction: column; gap: 6px;
}
.slot-btn {
  background: var(--color-surface-alt); border: none;
  color: var(--color-text); border-radius: 10px; padding: 12px 8px;
  font-size: 0.85rem; font-weight: 500; cursor: pointer; text-align: center; width: 100%;
}
.slot-btn:hover { color: var(--neon); }
.slot-btn--selected { background: var(--neon); color: var(--color-bg); }
.slot-employee { display: block; color: var(--color-text-muted); font-size: 0.72rem; margin-top: 2px; }
.empty-message { color: var(--color-text-muted); font-size: 0.82rem; text-align: center; padding: 24px 0; }

.step-form { display: flex; flex-direction: column; gap: 16px; }
.booking-employee { color: var(--neon); font-weight: 600; }
.booking-summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; justify-items: center; text-align: center; }
.summary-box {
  background: var(--color-surface-alt); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; color: var(--color-text);
}
.summary-meta { color: var(--color-text-muted); font-size: 0.82rem; margin-top: 2px; }
.summary-employee { color: var(--neon); font-size: 0.9rem; font-weight: 600; margin-top: 6px; }
.field-label { display: block; color: var(--color-text-label); font-size: 0.8rem; margin: 10px 0 4px; }
.required-mark { color: var(--color-error); font-weight: 700; }
.error-message { color: var(--color-error); font-size: 0.82rem; margin-top: 10px; }
.btn-confirm {
  width: 100%; background: var(--neon); color: var(--color-bg); border: none; font-weight: 600;
  padding: 12px; border-radius: 10px; margin-top: 16px; cursor: pointer; font-size: 0.92rem;
}
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

.step-confirm { text-align: center; padding: 20px 0; }
.confirm-icon {
  width: 52px; height: 52px; border-radius: 50%; background: var(--neon); color: var(--color-bg);
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 16px;
}
.confirm-title { color: var(--color-text); font-weight: 600; font-size: 1.05rem; margin: 0 0 6px; }
.confirm-text { color: var(--color-text-muted); font-size: 0.88rem; margin: 0 0 20px; }

@media (max-width: 420px) {
  .datetime-layout { flex-direction: column; min-height: auto; }
  .calendar-panel { border-right: none; border-bottom: 1px solid var(--color-border); padding-right: 0; padding-bottom: 16px; }
  .slots-panel { width: 100%; padding-left: 0; padding-top: 12px; }
}
</style>
