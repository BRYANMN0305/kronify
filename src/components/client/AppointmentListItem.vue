<template>
  <article class="appointment-card">
    <div class="appointment-main">
      <div>
        <h3>{{ appointment.serviceName }}</h3>
        <p>{{ formatDate(appointment.startAt) }} · {{ appointment.employeeName }}</p>
      </div>
      <AppointmentStatusBadge :status="appointment.status" />
    </div>

    <div class="appointment-actions">
      <button v-if="canCancel" class="btn btn-outline-danger btn-sm" :disabled="busy" @click="$emit('cancel', appointment)">
        Cancelar
      </button>
      <button v-if="canReview" class="btn btn-outline-light btn-sm" @click="showReview = !showReview">
        Reseñar
      </button>
    </div>

    <ReviewForm
      v-if="showReview"
      :appointment-id="appointment.appointmentId"
      @created="handleCreated"
    />
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import AppointmentStatusBadge from '@/components/agenda/AppointmentStatusBadge.vue'
import ReviewForm from '@/components/reviews/ReviewForm.vue'

const props = defineProps({
  appointment: { type: Object, required: true },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['cancel', 'reviewed'])

const showReview = ref(false)
const canCancel = computed(() => !['CANCELLED', 'COMPLETED'].includes(props.appointment.status))
const canReview = computed(() => props.appointment.status === 'COMPLETED')
const formatDate = (date) => dayjs(date).format('DD MMM YYYY, h:mm A')

function handleCreated(review) {
  showReview.value = false
  emit('reviewed', review)
}
</script>

<style scoped>
.appointment-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); padding: 14px; }
.appointment-main { align-items: flex-start; display: flex; justify-content: space-between; gap: 12px; }
h3 { font-size: 1rem; margin: 0 0 4px; }
p { color: var(--color-text-muted); margin: 0; }
.appointment-actions { display: flex; gap: 8px; margin-top: 12px; }
</style>
