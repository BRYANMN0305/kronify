<template>
  <article class="service-row">
    <div class="service-main">
      <div class="service-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>
      </div>
      <div class="service-copy">
        <div class="service-name">{{ service.name }}</div>
        <div class="service-meta">
          <span v-if="service.description">{{ service.description }}</span>
          <span>{{ service.durationMinutes }} min</span>
        </div>
      </div>
    </div>
    <div class="service-action">
      <span v-if="service.price" class="service-price">${{ service.price.toLocaleString() }}</span>
      <button class="btn-reserve" @click="$emit('book', service)">Reservar</button>
    </div>
  </article>
</template>

<script setup>
defineProps({
  service: { type: Object, required: true },
})
defineEmits(['book'])
</script>

<style scoped>
.service-row {
  align-items: stretch;
  background: linear-gradient(180deg, rgba(16, 37, 44, 0.96), rgba(13, 31, 38, 0.96));
  border: 1px solid rgba(213, 240, 247, 0.1);
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16);
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 18px;
  transition: border-color 0.16s, transform 0.16s;
}
.service-row:hover { border-color: rgba(63, 225, 255, 0.38); transform: translateY(-2px); }
.service-main { display: flex; align-items: flex-start; gap: 14px; min-width: 0; }
.service-icon {
  align-items: center;
  background: rgba(63, 225, 255, 0.12);
  border-radius: 12px;
  color: var(--neon);
  display: flex;
  flex-shrink: 0;
  height: 48px;
  justify-content: center;
  width: 48px;
}
.service-icon svg { width: 20px; height: 20px; }
.service-copy { min-width: 0; }
.service-name { color: var(--color-text); font-size: 1rem; font-weight: 800; }
.service-meta { color: rgba(213, 240, 247, 0.58); display: flex; flex-wrap: wrap; font-size: 0.82rem; gap: 8px; line-height: 1.4; margin-top: 6px; }
.service-meta span + span::before { color: rgba(213, 240, 247, 0.28); content: '•'; margin-right: 8px; }
.service-action { align-items: flex-end; display: flex; flex-direction: column; gap: 12px; justify-content: center; min-width: 132px; }
.service-price { color: var(--neon); font-size: 1.08rem; font-weight: 900; }
.btn-reserve {
  background: transparent;
  border: 1px solid rgba(63, 225, 255, 0.22);
  border-radius: 8px;
  color: var(--color-text-label);
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 700;
  padding: 8px 18px;
}
.btn-reserve:hover { background: rgba(63, 225, 255, 0.1); border-color: var(--neon); color: var(--neon); }
@media (max-width: 640px) {
  .service-row { flex-direction: column; }
  .service-action { align-items: stretch; flex-direction: row; justify-content: space-between; min-width: 0; }
}
</style>
