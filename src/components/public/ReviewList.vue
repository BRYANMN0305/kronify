<template>
  <div class="review-list">
    <ReviewCard v-for="review in reviews" :key="review.reviewId" :review="review" />
    <p v-if="!reviews.length" class="empty-message">Aun no hay resenas publicas.</p>
  </div>
</template>

<script setup>
import ReviewCard from '@/components/reviews/ReviewCard.vue'

defineProps({
  reviews: { type: Array, default: () => [] },
})
</script>

<style scoped>
.review-list { display: flex; flex-direction: column; gap: 10px; }
.empty-message { color: var(--color-text-muted); font-size: 0.9rem; }
</style>
