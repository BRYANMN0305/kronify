<template>
  <div class="kd-overlay" @click.self="close">
    <div
      class="kd-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="appointment.serviceName"
    >
      <header class="kd-header">
        <h3 class="kd-title">{{ appointment.serviceName }}</h3>
        <button class="kd-close" type="button" aria-label="Cerrar" @click="close">×</button>
      </header>

      <div class="kd-body">
        <section class="kd-section">
          <h4 class="kd-section-title">
            <span class="kd-section-dot"></span>
            Información de la cita
          </h4>
          <div class="kd-grid">
            <div class="kd-field">
              <span class="kd-field-label">Servicio</span>
              <span class="kd-field-value">{{ appointment.serviceName }}</span>
            </div>
            <div class="kd-field">
              <span class="kd-field-label">Profesional</span>
              <span class="kd-field-value">{{ appointment.employeeName }}</span>
            </div>
            <div class="kd-field">
              <span class="kd-field-label">Fecha</span>
              <span class="kd-field-value">{{ formatLongDate(appointment.startAt) }}</span>
            </div>
            <div class="kd-field">
              <span class="kd-field-label">Hora</span>
              <span class="kd-field-value">{{ formatTime(appointment.startAt) }}</span>
            </div>
            <div class="kd-field">
              <span class="kd-field-label">Duración</span>
              <span class="kd-field-value">{{ appointment.serviceDurationMinutes }} min</span>
            </div>
            <div class="kd-field">
              <span class="kd-field-label">Estado</span>
              <span class="kd-field-value">
                <span class="kd-status-badge" :class="`kd-status-${appointment.status}`">
                  {{ statusLabel(appointment.status) }}
                </span>
              </span>
            </div>
          </div>
        </section>

        <section v-if="!canManage" class="kd-section">
          <h4 class="kd-section-title">
            <span class="kd-section-dot"></span>
            Gestión de la cita
          </h4>
          <p class="kd-empty">
            Para confirmar, reprogramar o cancelar tu cita debes iniciar sesión como cliente registrado.
          </p>
        </section>

        <template v-else>
          <section class="kd-section">
            <h4 class="kd-section-title">
              <span class="kd-section-dot"></span>
              Confirmar cita
            </h4>
            <p class="kd-hint">Confirma esta cita para reservar tu horario definitivamente.</p>
            <p v-if="error" class="kd-error">{{ error }}</p>
            <button
              class="kd-btn kd-btn-primary"
              :disabled="confirming || !canConfirm"
              @click="confirmAppointment"
            >
              {{ confirming ? 'Confirmando...' : 'Confirmar cita' }}
            </button>
          </section>

          <section class="kd-section">
            <h4 class="kd-section-title">
              <span class="kd-section-dot"></span>
              Reprogramar cita
            </h4>

            <template v-if="canReschedule">
              <label class="kd-label" for="kd-date">Nueva fecha</label>
              <input
                id="kd-date"
                v-model="newDate"
                class="kd-select"
                type="date"
                :min="today"
                @change="onDateChange"
              />
              <button
                class="kd-btn kd-btn-secondary"
                :disabled="loadingSlots"
                @click="loadRescheduleSlots"
              >
                {{ loadingSlots ? 'Consultando...' : 'Buscar horarios disponibles' }}
              </button>

              <div v-if="loadingSlots" class="kd-slots-loading">Consultando disponibilidad...</div>

              <template v-else-if="rescheduleSlots.length">
                <p class="kd-hint">Selecciona un horario disponible:</p>
                <div class="kd-slots">
                  <button
                    v-for="slot in rescheduleSlots"
                    :key="slot.startAt"
                    type="button"
                    class="kd-slot"
                    :class="{ 'is-selected': newStartAt === slot.startAt }"
                    @click="newStartAt = slot.startAt"
                  >
                    {{ formatTime(slot.startAt) }}
                  </button>
                </div>
              </template>

              <p v-else-if="slotsLoaded" class="kd-empty">No hay horarios disponibles para esa fecha.</p>

              <button
                class="kd-btn kd-btn-primary kd-btn-reschedule"
                :disabled="rescheduling || !newStartAt"
                @click="saveReschedule"
              >
                {{ rescheduling ? 'Reprogramando...' : 'Reprogramar cita' }}
              </button>
            </template>

            <p v-else class="kd-empty">No hay datos suficientes para reprogramar esta cita.</p>
          </section>

          <section class="kd-section kd-section-danger">
            <h4 class="kd-section-title">
              <span class="kd-section-dot"></span>
              Cancelar cita
            </h4>
            <p class="kd-hint">Una vez cancelada no podrás revertir la acción.</p>
            <button
              class="kd-btn kd-btn-danger"
              :disabled="cancelling || !canCancel"
              @click="cancelAppointment"
            >
              {{ cancelling ? 'Cancelando...' : 'Cancelar cita' }}
            </button>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import { request } from '@/api/http'
import { appointmentService } from '@/api/appointment'
import { publicBusinessService } from '@/api/publicBusiness'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  appointment: { type: Object, required: true },
})
const emit = defineEmits(['close', 'updated'])

const authStore = useAuthStore()

const today = dayjs().format('YYYY-MM-DD')
const newDate = ref(dayjs(props.appointment.startAt).format('YYYY-MM-DD'))
const newStartAt = ref('')
const rescheduleSlots = ref([])
const slotsLoaded = ref(false)
const loadingSlots = ref(false)
const confirming = ref(false)
const cancelling = ref(false)
const rescheduling = ref(false)
const error = ref('')

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
}

const canManage = computed(
  () => authStore.isAuthenticated && authStore.profileType === 'CLIENT'
)
const canConfirm = computed(
  () => canManage.value && props.appointment.status === 'PENDING'
)
const canCancel = computed(
  () => canManage.value && ['PENDING', 'CONFIRMED'].includes(props.appointment.status)
)
const canReschedule = computed(
  () => canManage.value && !['COMPLETED', 'CANCELLED'].includes(props.appointment.status)
)

function formatLongDate(dateStr) {
  const d = dayjs(dateStr)
  return `${d.date()} de ${MONTHS[d.month()]} de ${d.year()}`
}

function formatTime(dateStr) {
  return dayjs(dateStr).format('h:mm A')
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status
}

function close() {
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

function onDateChange() {
  newStartAt.value = ''
  rescheduleSlots.value = []
  slotsLoaded.value = false
}

async function confirmAppointment() {
  if (!canManage.value) return
  confirming.value = true
  error.value = ''
  try {
    const updated = await request(`/appointments/${props.appointment.appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CONFIRMED' }),
    })
    emit('updated', updated)
  } catch (err) {
    error.value = err.message || 'No se pudo confirmar la cita.'
  } finally {
    confirming.value = false
  }
}

async function loadRescheduleSlots() {
  if (!canManage.value) return
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
  if (!canManage.value) return
  rescheduling.value = true
  error.value = ''
  try {
    const updated = await request(`/appointments/${props.appointment.appointmentId}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({ startAt: newStartAt.value }),
    })
    emit('updated', updated)
  } catch (err) {
    error.value = err.message || 'No se pudo reprogramar la cita.'
  } finally {
    rescheduling.value = false
  }
}

async function cancelAppointment() {
  if (!canManage.value) return
  cancelling.value = true
  error.value = ''
  try {
    const updated = await appointmentService.cancel(props.appointment.appointmentId)
    emit('updated', updated)
  } catch (err) {
    error.value = err.message || 'No se pudo cancelar la cita.'
  } finally {
    cancelling.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.kd-overlay {
  align-items: center;
  background: rgba(6, 13, 16, 0.82);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 18px;
  position: fixed;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.kd-modal {
  background: radial-gradient(circle at top, rgba(63, 225, 255, 0.06), transparent 42%), #0f2027;
  border: 1px solid rgba(63, 225, 255, 0.16);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(63, 106, 120, 0.25);
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-height: 90vh;
  max-width: 660px;
  overflow: hidden;
  width: 100%;
  animation: kd-pop 0.16s ease-out;
}

@keyframes kd-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.kd-header {
  align-items: center;
  border-bottom: 1px solid rgba(63, 106, 120, 0.45);
  display: flex;
  justify-content: space-between;
  padding: 18px 22px;
}
.kd-title {
  color: #d5f0f7;
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}
.kd-close {
  background: rgba(63, 106, 120, 0.35);
  border: 1px solid rgba(63, 106, 120, 0.5);
  border-radius: 50%;
  color: #d5f0f7;
  cursor: pointer;
  font-size: 1.15rem;
  height: 34px;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  width: 34px;
}
.kd-close:hover {
  background: rgba(63, 225, 255, 0.16);
  border-color: rgba(63, 225, 255, 0.55);
  color: #3fe1ff;
}

.kd-body {
  overflow-y: auto;
  padding: 8px 22px 22px;
}

.kd-section {
  border: 1px solid rgba(63, 106, 120, 0.4);
  border-radius: 12px;
  background: rgba(16, 37, 44, 0.5);
  margin-top: 14px;
  padding: 14px 16px;
}
.kd-section-title {
  align-items: center;
  color: #3fe1ff;
  display: flex;
  font-size: 0.78rem;
  font-weight: 800;
  gap: 8px;
  letter-spacing: 0.06em;
  margin: 0 0 12px;
  text-transform: uppercase;
}
.kd-section-dot {
  background: #3fe1ff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(63, 225, 255, 0.7);
  display: inline-block;
  height: 6px;
  width: 6px;
}

.kd-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}
.kd-field {
  background: rgba(63, 106, 120, 0.3);
  border: 1px solid rgba(63, 106, 120, 0.35);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 9px 12px;
}
.kd-field-label {
  color: rgba(213, 240, 247, 0.55);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.kd-field-value {
  color: #d5f0f7;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.35;
}

.kd-status-badge {
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  padding: 4px 11px;
}
.kd-status-PENDING {
  background: rgba(63, 225, 255, 0.14);
  border: 1px solid rgba(63, 225, 255, 0.45);
  color: #3fe1ff;
}
.kd-status-CONFIRMED {
  background: rgba(78, 221, 160, 0.13);
  border: 1px solid rgba(78, 221, 160, 0.45);
  color: #5fe3a8;
}
.kd-status-COMPLETED {
  background: rgba(213, 240, 247, 0.12);
  border: 1px solid rgba(213, 240, 247, 0.4);
  color: #d5f0f7;
}
.kd-status-CANCELLED,
.kd-status-NO_SHOW {
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.4);
  color: #ff8585;
}

.kd-hint {
  color: rgba(213, 240, 247, 0.6);
  font-size: 0.78rem;
  margin: 0;
}
.kd-label {
  color: rgba(213, 240, 247, 0.75);
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  margin: 12px 0 6px;
}
.kd-select {
  appearance: none;
  background-color: #1e3d49;
  background-image: linear-gradient(45deg, transparent 50%, #3fe1ff 50%), linear-gradient(135deg, #3fe1ff 50%, transparent 50%);
  background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%;
  background-repeat: no-repeat;
  background-size: 5px 5px, 5px 5px;
  border: 1px solid rgba(63, 106, 120, 0.55);
  border-radius: 8px;
  color: #d5f0f7;
  font-size: 0.88rem;
  height: 40px;
  padding: 0 12px;
  transition: border-color 0.15s;
  width: 100%;
}
.kd-select:focus {
  border-color: #3fe1ff;
  outline: none;
}
.kd-select option {
  background: #10252c;
  color: #d5f0f7;
}
input.kd-select::-webkit-calendar-picker-indicator {
  filter: invert(0.85);
}

.kd-error {
  color: #ff8585;
  font-size: 0.8rem;
  margin: 10px 0 0;
}

.kd-btn {
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 700;
  height: 42px;
  margin-top: 12px;
  padding: 0 18px;
  transition: background 0.15s, border-color 0.15s, color 0.15s, filter 0.15s;
  width: 100%;
}
.kd-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.kd-btn-primary {
  background: #3fe1ff;
  border: 1px solid #3fe1ff;
  color: #081013;
}
.kd-btn-primary:hover:not(:disabled) {
  filter: brightness(1.08);
}
.kd-btn-secondary {
  background: transparent;
  border: 1px solid rgba(213, 240, 247, 0.35);
  color: #d5f0f7;
}
.kd-btn-secondary:hover:not(:disabled) {
  border-color: #3fe1ff;
  color: #3fe1ff;
}
.kd-btn-danger {
  background: transparent;
  border: 1px solid rgba(255, 107, 107, 0.5);
  color: #ff8585;
}
.kd-btn-danger:hover:not(:disabled) {
  background: rgba(255, 107, 107, 0.12);
  border-color: #ff8585;
}
.kd-btn-reschedule {
  margin-top: 16px;
}
.kd-section-danger .kd-section-title {
  color: #ff8585;
}
.kd-section-danger .kd-section-dot {
  background: #ff8585;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.7);
}

.kd-slots-loading,
.kd-empty {
  color: rgba(213, 240, 247, 0.65);
  font-size: 0.82rem;
  margin: 12px 0 0;
}
.kd-slots {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
  margin-top: 12px;
}
.kd-slot {
  background: rgba(63, 106, 120, 0.35);
  border: 1px solid rgba(63, 106, 120, 0.5);
  border-radius: 8px;
  color: #d5f0f7;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 9px 6px;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.kd-slot:hover {
  border-color: rgba(63, 225, 255, 0.6);
}
.kd-slot.is-selected {
  background: #3fe1ff;
  border-color: #3fe1ff;
  color: #081013;
}

@media (max-width: 640px) {
  .kd-grid {
    grid-template-columns: 1fr;
  }
  .kd-header {
    padding: 15px 16px;
  }
  .kd-body {
    padding: 8px 16px 16px;
  }
}
</style>