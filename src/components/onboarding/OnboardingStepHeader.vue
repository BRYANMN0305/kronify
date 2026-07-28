<template>
  <div class="step-header">
    <span class="step-counter">Paso {{ current }} de {{ total }}</span>
    <h2 class="step-title">{{ title }}</h2>
    <p class="step-description">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<style scoped>
.step-header {
  margin-bottom: 1.5rem;
}

.step-counter {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--neon-dim);
  margin-bottom: 0.35rem;
}

.step-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-label);
  margin: 0 0 0.25rem;
}

.step-description {
  font-size: 1rem;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
