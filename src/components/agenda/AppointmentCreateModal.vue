<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Nueva cita</h3>
        <button class="btn-icon" @click="$emit('close')">x</button>
      </div>

      <div class="modal-body">
        <label class="field-label">Servicio</label>
        <select v-model="form.serviceId" class="field-select" @change="resetAvailability">
          <option value="">Selecciona un servicio</option>
          <option v-for="service in services" :key="service.serviceId || service.id" :value="service.serviceId || service.id">
            {{ service.name }}
          </option>
        </select>

        <label class="field-label">Empleado</label>
        <select v-model="form.employeeId" class="field-select" @change="resetAvailability">
          <option value="">Selecciona un empleado</option>
          <option v-for="employee in employees" :key="employee.employeeId" :value="employee.employeeId">
            {{ employee.name }} {{ employee.lastName || '' }}
          </option>
        </select>

        <label class="field-label">Fecha</label>
        <input v-model="date" class="field-select" type="date" :min="today" @change="resetAvailability" />

        <button class="btn-secondary" :disabled="loadingSlots || !canLoadSlots" @click="loadSlots">
          {{ loadingSlots ? 'Consultando...' : 'Consultar disponibilidad' }}
        </button>

        <div v-if="slots.length" class="slots-grid">
          <button
            v-for="slot in slots"
            :key="slot.startAt"
            class="slot-btn"
            :class="{ 'is-selected': form.startAt === slot.startAt }"
            @click="selectSlot(slot)"
          >
            {{ formatTime(slot.startAt) }}
          </button>
        </div>
        <p v-else-if="slotsLoaded" class="empty-message">No hay horarios disponibles.</p>

        <div class="form-grid">
          <label class="field-label">Nombre</label>
          <input v-model.trim="form.customerName" class="field-select" />
          <label class="field-label">Apellido</label>
          <input v-model.trim="form.customerLastName" class="field-select" />
          <label class="field-label">Telefono</label>
          <input v-model.trim="form.customerPhone" class="field-select" />
          <label class="field-label">Email</label>
          <input v-model.trim="form.customerEmail" class="field-select" type="email" />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Creando...' : 'Crear cita' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { businessAppointmentService } from '@/api/businessAppointments'
import { publicBusinessService } from '@/api/publicBusiness'

const props = defineProps({
  businessId: { type: Number, default: null },
  services: { type: Array, default: () => [] },
  employees: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'created'])

const today = dayjs().format('YYYY-MM-DD')
const date = ref(today)
const slots = ref([])
const slotsLoaded = ref(false)
const loadingSlots = ref(false)
const saving = ref(false)
const error = ref('')
const form = reactive({
  serviceId: '',
  employeeId: '',
  startAt: '',
  customerName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
})

const canLoadSlots = computed(() => props.businessId && form.serviceId && form.employeeId && date.value)

function resetAvailability() {
  slots.value = []
  slotsLoaded.value = false
  form.startAt = ''
}

async function loadSlots() {
  if (!canLoadSlots.value) return
  loadingSlots.value = true
  error.value = ''
  try {
    const res = await publicBusinessService.getAvailability(props.businessId, form.serviceId, date.value, form.employeeId)
    slots.value = res?.slots || []
    slotsLoaded.value = true
  } catch (err) {
    error.value = err.message || 'No se pudo consultar disponibilidad'
  } finally {
    loadingSlots.value = false
  }
}

function selectSlot(slot) {
  form.startAt = slot.startAt
}

async function save() {
  if (!form.serviceId || !form.employeeId || !form.startAt || !form.customerName || !form.customerPhone || !form.customerEmail) {
    error.value = 'Completa servicio, empleado, horario, nombre, telefono y email.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const created = await businessAppointmentService.create({
      serviceId: Number(form.serviceId),
      employeeId: Number(form.employeeId),
      startAt: form.startAt,
      customerName: form.customerName,
      customerLastName: form.customerLastName || null,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
    })
    emit('created', created)
    emit('close')
  } catch (err) {
    error.value = err.message || 'No se pudo crear la cita'
  } finally {
    saving.value = false
  }
}

const formatTime = (value) => dayjs(value).format('h:mm A')
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(6,13,16,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--color-border); }
.modal-title { color: var(--color-text); font-size: 1rem; font-weight: 800; margin: 0; }
.btn-icon { background: none; border: none; color: var(--color-text-muted); font-size: 1.1rem; cursor: pointer; }
.modal-body { padding: 16px 18px; }
.field-label { display: block; color: var(--color-text-label); font-size: 0.8rem; margin: 12px 0 5px; }
.field-select { width: 100%; background: var(--color-surface-alt); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 8px; padding: 10px 12px; font-size: 0.9rem; }
.slots-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
.slot-btn { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); padding: 9px; }
.slot-btn.is-selected, .slot-btn:hover { border-color: var(--neon); color: var(--neon); }
.form-grid { margin-top: 8px; }
.empty-message { color: var(--color-text-muted); margin: 12px 0 0; }
.error-message { color: var(--color-error); font-size: 0.82rem; margin-top: 10px; }
.btn-primary, .btn-secondary { width: 100%; border-radius: 10px; cursor: pointer; font-weight: 800; margin-top: 12px; padding: 12px; }
.btn-primary { background: var(--neon); border: none; color: var(--color-bg); }
.btn-secondary { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-label); }
.btn-primary:disabled, .btn-secondary:disabled { cursor: not-allowed; opacity: 0.55; }
@media (max-width: 520px) { .slots-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
