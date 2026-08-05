<template>
  <div v-if="modelValue" class="booking-overlay" @click.self="close">
    <div class="booking-modal">
      <div class="booking-header">
        <button v-if="step > 1 && step < 4" class="btn-icon" @click="back">←</button>
        <h2 class="booking-title">{{ stepTitle }}</h2>
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
        <div v-else-if="step === 3" class="step-date">
          <input type="date" v-model="selectedDate" :min="today" class="form-control" @change="loadAvailability" />

          <div v-if="loadingSlots" class="empty-message">Cargando horarios...</div>
          <div v-else-if="slots.length === 0" class="empty-message">No hay horarios disponibles ese día.</div>
          <div v-else class="slots-grid">
            <button
              v-for="(slot, idx) in slots"
              :key="idx"
              class="slot-btn"
              @click="selectSlot(slot)"
            >
              {{ formatTime(slot.startAt) }}
              <span v-if="!selectedEmployeeId" class="slot-employee">{{ slot.employeeName }}</span>
            </button>
          </div>
        </div>

        <!-- Paso 4: Datos del cliente -->
        <div v-else-if="step === 4" class="step-form">
          <div class="summary-box">
            <div>{{ selectedService.name }}</div>
            <div class="summary-meta">{{ formatDate(selectedSlot.startAt) }} · {{ selectedSlot.employeeName }}</div>
          </div>

          <label class="field-label">Nombre</label>
          <input v-model="form.customerName" class="form-control" placeholder="Tu nombre" />

          <label class="field-label">Apellido</label>
          <input v-model="form.customerLastName" class="form-control" placeholder="Tu apellido" />

          <label class="field-label">Teléfono</label>
          <input v-model="form.customerPhone" class="form-control" placeholder="Tu teléfono" />

          <label class="field-label">Email</label>
          <input v-model="form.customerEmail" type="email" class="form-control" placeholder="Tu email" />

          <p v-if="submitError" class="error-message">{{ submitError }}</p>

          <button class="btn-confirm" :disabled="submitting" @click="submit">
            {{ submitting ? 'Reservando...' : 'Confirmar reserva' }}
          </button>
        </div>

        <!-- Paso 5: Confirmación -->
        <div v-else class="step-confirm">
          <div class="confirm-icon">✓</div>
          <p class="confirm-title">¡Reserva confirmada!</p>
          <p class="confirm-text">Te esperamos el {{ formatDate(selectedSlot.startAt) }}.</p>
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

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  business: { type: Object, required: true },
  initialService: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'booked'])

const step = ref(1)
const selectedService = ref(null)
const selectedEmployeeId = ref(null)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const slots = ref([])
const loadingSlots = ref(false)
const selectedSlot = ref(null)
const submitting = ref(false)
const submitError = ref(null)

const form = ref({
  customerName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
})

const today = dayjs().format('YYYY-MM-DD')

const employeesForService = computed(() => {
  if (!selectedService.value) return []
  return (props.business.employees || []).filter((emp) =>
    emp.serviceIds.includes(selectedService.value.serviceId)
  )
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

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    selectedService.value = props.initialService || null
    selectedEmployeeId.value = null
    selectedDate.value = dayjs().format('YYYY-MM-DD')
    slots.value = []
    selectedSlot.value = null
    submitError.value = null
    form.value = { customerName: '', customerLastName: '', customerPhone: '', customerEmail: '' }
    step.value = selectedService.value ? 2 : 1
  }
)

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
  } finally {
    loadingSlots.value = false
  }
}

function selectSlot(slot) {
  selectedSlot.value = slot
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
    await appointmentService.create(payload)
    step.value = 5
    emit('booked')
  } catch (err) {
    submitError.value = err?.message || 'No se pudo completar la reserva. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}

function formatTime(dateStr) {
  return dayjs(dateStr).format('h:mm A')
}
function formatDate(dateStr) {
  return dayjs(dateStr).format('DD MMM YYYY, h:mm A')
}
</script>

<style scoped>
.booking-overlay {
  position: fixed; inset: 0; background: rgba(6, 13, 16, 0.75);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.booking-modal {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 16px; width: 100%; max-width: 420px; max-height: 85vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.booking-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-bottom: 1px solid var(--color-border);
}
.booking-title { color: var(--color-text); font-size: 1rem; font-weight: 600; margin: 0; }
.btn-icon { background: none; border: none; color: var(--color-text-muted); font-size: 1.1rem; cursor: pointer; padding: 4px 8px; }
.booking-body { padding: 16px 18px; overflow-y: auto; }

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

.slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
@media (max-width: 420px) {
  .slots-grid { grid-template-columns: repeat(2, 1fr); }
}
.slot-btn {
  background: var(--color-surface-alt); border: 1px solid var(--color-border); color: var(--color-text);
  border-radius: 8px; padding: 10px 6px; font-size: 0.82rem; cursor: pointer; text-align: center;
}
.slot-btn:hover { border-color: var(--neon); color: var(--neon); }
.slot-employee { display: block; color: var(--color-text-muted); font-size: 0.72rem; margin-top: 2px; }
.empty-message { color: var(--color-text-muted); font-size: 0.85rem; text-align: center; padding: 24px 0; }

.summary-box {
  background: var(--color-surface-alt); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; color: var(--color-text);
}
.summary-meta { color: var(--neon); font-size: 0.82rem; margin-top: 2px; }
.field-label { display: block; color: var(--color-text-label); font-size: 0.8rem; margin: 10px 0 4px; }
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
</style>