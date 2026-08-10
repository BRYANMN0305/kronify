<template>
  <article class="review-card">
    <div class="review-head">
      <strong>{{ review.customerName || 'Cliente' }}</strong>
      <span class="stars">{{ stars }}</span>
    </div>
    <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
    <small>{{ formatDate(review.createdAt) }}</small>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  review: { type: Object, required: true },
})

const stars = computed(() => '★'.repeat(props.review.rating || 0))
const formatDate = (date) => dayjs(date).format('DD MMM YYYY')
</script>

<style scoped>
.review-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); padding: 14px; }
.review-head { align-items: center; display: flex; justify-content: space-between; gap: 12px; }
.stars { color: var(--neon); letter-spacing: 1px; }
.review-comment { color: var(--color-text-label); margin: 10px 0; }
small { color: var(--color-text-muted); }
</style>
