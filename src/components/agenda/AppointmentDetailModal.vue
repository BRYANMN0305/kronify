<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ appointment.serviceName }}</h3>
        <button class="btn-icon" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="row"><span class="label">Cliente</span><span>{{ appointment.customerName || 'Sin nombre' }}</span></div>
        <div class="row" v-if="appointment.customerPhone"><span class="label">Teléfono</span><span>{{ appointment.customerPhone }}</span></div>
        <div class="row" v-if="appointment.customerEmail"><span class="label">Email</span><span>{{ appointment.customerEmail }}</span></div>
        <div class="row"><span class="label">Profesional</span><span>{{ appointment.employeeName }}</span></div>
        <div class="row"><span class="label">Fecha</span><span>{{ formatDate(appointment.startAt) }}</span></div>
        <div class="row"><span class="label">Duración</span><span>{{ appointment.serviceDurationMinutes }} min</span></div>
        <div class="row"><span class="label">Origen</span><span>{{ originLabel(appointment.origin) }}</span></div>

        <label class="field-label">Estado</label>
        <select v-model="newStatus" class="field-select">
          <option value="PENDING">Pendiente</option>
          <option value="CONFIRMED">Confirmada</option>
          <option value="COMPLETED">Completada</option>
          <option value="CANCELLED">Cancelada</option>
          <option value="NO_SHOW">No asistió</option>
        </select>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button class="btn-primary" :disabled="saving || newStatus === appointment.status" @click="saveStatus">
          {{ saving ? 'Guardando...' : 'Actualizar estado' }}
        </button>

        <label class="field-label">Reprogramar</label>
        <input v-model="newDate" class="field-select" type="date" :min="today" @change="loadRescheduleSlots" />
        <button class="btn-secondary" :disabled="loadingSlots" @click="loadRescheduleSlots">
          {{ loadingSlots ? 'Consultando...' : 'Buscar horarios disponibles' }}
        </button>
        <div v-if="rescheduleSlots.length" class="slots-grid">
          <button
            v-for="slot in rescheduleSlots"
            :key="slot.startAt"
            class="slot-btn"
            :class="{ 'is-selected': newStartAt === slot.startAt }"
            @click="newStartAt = slot.startAt"
          >
            {{ formatTime(slot.startAt) }}
          </button>
        </div>
        <p v-else-if="slotsLoaded" class="empty-message">No hay horarios disponibles para esa fecha.</p>
        <button class="btn-secondary" :disabled="rescheduling || !newStartAt" @click="saveReschedule">
          {{ rescheduling ? 'Reprogramando...' : 'Reprogramar cita' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { businessAppointmentService } from '@/api/businessAppointments'
import { publicBusinessService } from '@/api/publicBusiness'

const props = defineProps({
  appointment: { type: Object, required: true },
})
const emit = defineEmits(['close', 'updated'])

const newStatus = ref(props.appointment.status)
const today = dayjs().format('YYYY-MM-DD')
const newDate = ref(dayjs(props.appointment.startAt).format('YYYY-MM-DD'))
const newStartAt = ref('')
const rescheduleSlots = ref([])
const slotsLoaded = ref(false)
const loadingSlots = ref(false)
const saving = ref(false)
const rescheduling = ref(false)
const error = ref('')

function formatDate(dateStr) {
  return dayjs(dateStr).format('DD MMM YYYY, h:mm A')
}
function formatTime(dateStr) {
  return dayjs(dateStr).format('h:mm A')
}
function originLabel(origin) {
  return { PUBLIC: 'Cliente (público)', PRIVATE: 'Negocio', ADMIN: 'Admin' }[origin] || origin
}

async function saveStatus() {
  saving.value = true
  error.value = ''
  try {
    const updated = await businessAppointmentService.updateStatus(props.appointment.appointmentId, {
      status: newStatus.value,
    })
    emit('updated', updated)
    emit('close')
  } catch (err) {
    error.value = err.message || 'No se pudo actualizar el estado.'
  } finally {
    saving.value = false
  }
}

async function loadRescheduleSlots() {
  loadingSlots.value = true
  error.value = ''
  newStartAt.value = ''
  try {
    const res = await publicBusinessService.getAvailability(
      props.appointment.businessId,
      props.appointment.serviceId,
      newDate.value,
      props.appointment.employeeId
    )
    rescheduleSlots.value = (res?.slots || []).filter((slot) => slot.startAt !== props.appointment.startAt)
    slotsLoaded.value = true
  } catch (err) {
    error.value = err.message || 'No se pudo consultar disponibilidad.'
    rescheduleSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}

async function saveReschedule() {
  rescheduling.value = true
  error.value = ''
  try {
    const updated = await businessAppointmentService.reschedule(props.appointment.appointmentId, {
      startAt: newStartAt.value,
    })
    emit('updated', updated)
    emit('close')
  } catch (err) {
    error.value = err.message || 'No se pudo reprogramar la cita.'
  } finally {
    rescheduling.value = false
  }
}
</script>

<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(6,13,16,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; width: 100%; max-width: 400px; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--color-border); }
.modal-title { color: var(--color-text); font-size: 1rem; font-weight: 600; margin: 0; }
.btn-icon { background: none; border: none; color: var(--color-text-muted); font-size: 1.1rem; cursor: pointer; }
.modal-body { padding: 16px 18px; }
.row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; color: var(--color-text); border-bottom: 1px solid var(--color-border); }
.label { color: var(--color-text-muted); }
.field-label { display: block; color: var(--color-text-label); font-size: 0.8rem; margin: 14px 0 4px; }
.field-select {
  width: 100%; background: var(--color-surface-alt); border: 1px solid var(--color-border);
  color: var(--color-text); border-radius: 8px; padding: 10px 12px; font-size: 0.9rem;
}
.error-message { color: var(--color-error); font-size: 0.82rem; margin-top: 10px; }
.btn-primary {
  width: 100%; background: var(--neon); color: var(--color-bg); border: none; font-weight: 600;
  padding: 12px; border-radius: 10px; margin-top: 16px; cursor: pointer; font-size: 0.9rem;
}
.btn-secondary {
  width: 100%; background: transparent; color: var(--color-text-label); border: 1px solid var(--color-border); font-weight: 600;
  padding: 12px; border-radius: 10px; margin-top: 10px; cursor: pointer; font-size: 0.9rem;
}
.btn-secondary:hover { border-color: var(--neon); color: var(--neon); }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.slot-btn { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); padding: 9px; }
.slot-btn:hover, .slot-btn.is-selected { border-color: var(--neon); color: var(--neon); }
.empty-message { color: var(--color-text-muted); font-size: 0.82rem; margin: 10px 0 0; }
</style>
