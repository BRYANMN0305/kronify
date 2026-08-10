<template>
  <form class="review-form" @submit.prevent="submit">
    <label class="field-label">Calificacion</label>
    <select v-model.number="rating" class="form-select">
      <option :value="5">5 estrellas</option>
      <option :value="4">4 estrellas</option>
      <option :value="3">3 estrellas</option>
      <option :value="2">2 estrellas</option>
      <option :value="1">1 estrella</option>
    </select>

    <label class="field-label">Comentario</label>
    <textarea v-model.trim="comment" class="form-control" rows="3" maxlength="1000" placeholder="Cuenta como fue tu experiencia"></textarea>

    <p v-if="error" class="error-message">{{ error }}</p>
    <button class="btn btn-primary" :disabled="submitting" type="submit">
      {{ submitting ? 'Enviando...' : 'Enviar resena' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { reviewService } from '@/api/review'

const props = defineProps({
  appointmentId: { type: Number, required: true },
})
const emit = defineEmits(['created'])

const rating = ref(5)
const comment = ref('')
const submitting = ref(false)
const error = ref('')

async function submit() {
  submitting.value = true
  error.value = ''
  try {
    const review = await reviewService.create({
      appointmentId: props.appointmentId,
      rating: rating.value,
      comment: comment.value || null,
    })
    emit('created', review)
  } catch (err) {
    error.value = err.message || 'No se pudo enviar la resena'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.review-form { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; display: grid; gap: 8px; margin-top: 10px; padding: 12px; }
.field-label { color: var(--color-text-label); font-size: 0.82rem; }
.error-message { color: var(--color-error); font-size: 0.82rem; margin: 0; }
</style>
