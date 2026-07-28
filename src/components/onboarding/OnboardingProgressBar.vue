<template>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: ((current / total) * 100) + '%' }"></div>
  </div>
</template>

<script setup>
defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
})
</script>

<style scoped>
.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--neon);
  border-radius: 2px;
  transition: width 0.4s ease;
}
</style>
