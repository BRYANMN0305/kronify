<template>
  <div class="service-row">
    <div class="service-main">
      <div class="service-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>
      </div>
      <div>
        <div class="service-name">{{ service.name }}</div>
        <div class="service-meta">
          <span v-if="service.description">{{ service.description }} · </span>{{ service.durationMinutes }} min
        </div>
      </div>
    </div>
    <div class="service-action">
      <span v-if="service.price" class="service-price">${{ service.price.toLocaleString() }}</span>
      <button class="btn-reserve" @click="$emit('book', service)">Reservar</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  service: { type: Object, required: true },
})
defineEmits(['book'])
</script>

<style scoped>
.service-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 12px; padding: 14px 16px; gap: 12px; flex-wrap: wrap;
}
.service-main { display: flex; align-items: center; gap: 14px; }
.service-icon {
  width: 40px; height: 40px; border-radius: 10px; background: var(--color-surface-alt);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--neon);
}
.service-icon svg { width: 18px; height: 18px; }
.service-name { color: var(--color-text); font-weight: 500; font-size: 0.95rem; }
.service-meta { color: var(--color-text-muted); font-size: 0.8rem; margin-top: 2px; }
.service-action { display: flex; align-items: center; gap: 16px; }
.service-price { color: var(--neon); font-weight: 600; }
.btn-reserve {
  background: transparent; border: 1px solid var(--color-border); color: var(--color-text-label);
  padding: 7px 16px; border-radius: 8px; font-size: 0.82rem; cursor: pointer;
}
.btn-reserve:hover { border-color: var(--neon); color: var(--neon); }
</style>