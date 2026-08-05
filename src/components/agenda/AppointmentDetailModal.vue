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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import { businessAppointmentService } from '@/api/businessAppointments'

const props = defineProps({
  appointment: { type: Object, required: true },
})
const emit = defineEmits(['close', 'updated'])

const newStatus = ref(props.appointment.status)
const saving = ref(false)
const error = ref('')

function formatDate(dateStr) {
  return dayjs(dateStr).format('DD MMM YYYY, h:mm A')
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
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>