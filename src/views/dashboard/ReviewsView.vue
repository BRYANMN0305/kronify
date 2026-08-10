<template>
  <div class="work-page">
    <header class="work-header">
      <h1>Reseñas</h1>
      <button class="btn btn-outline-light" @click="load">Actualizar</button>
    </header>

    <div v-if="loading" class="state">Cargando reseñas...</div>
    <div v-else-if="error" class="state state-error">{{ error }}</div>
    <div v-else-if="reviews.length === 0" class="state">Aun no hay reseñas.</div>

    <div v-else class="reviews-table">
      <article v-for="review in reviews" :key="review.reviewId" class="review-row">
        <div>
          <strong>{{ review.customerName || 'Cliente' }}</strong>
          <p>{{ '★'.repeat(review.rating) }} <span>{{ review.comment || 'Sin comentario' }}</span></p>
        </div>
        <button class="btn btn-sm" :class="review.visible ? 'btn-outline-warning' : 'btn-outline-light'" @click="toggle(review)">
          {{ review.visible ? 'Ocultar' : 'Mostrar' }}
        </button>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { reviewService } from '@/api/review'

const reviews = ref([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const page = await reviewService.listBusinessReviews({ size: 50 })
    reviews.value = page?.content || []
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar las reseñas'
  } finally {
    loading.value = false
  }
}

async function toggle(review) {
  try {
    const updated = await reviewService.updateVisibility(review.reviewId, { visible: !review.visible })
    reviews.value = reviews.value.map((item) => item.reviewId === updated.reviewId ? updated : item)
  } catch (err) {
    error.value = err.message || 'No se pudo actualizar la visibilidad'
  }
}

onMounted(load)
</script>

<style scoped>
.work-page { background: var(--color-bg); color: var(--color-text); min-height: 100vh; padding: 28px; }
.work-header { align-items: center; display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.work-header h1 { font-size: 1.5rem; margin: 0; }
.reviews-table { display: flex; flex-direction: column; gap: 10px; }
.review-row { align-items: center; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; display: flex; justify-content: space-between; gap: 14px; padding: 14px; }
.review-row p { color: var(--neon); margin: 4px 0 0; }
.review-row span { color: var(--color-text-muted); margin-left: 8px; }
.state { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); padding: 18px; }
.state-error { color: var(--color-error); }
</style>
