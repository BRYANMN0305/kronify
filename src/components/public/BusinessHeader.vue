<template>
  <div class="business-header">
    <div class="cover">
      <div class="cover-bg">
        <div class="cover-pattern"></div>
      </div>
      <div class="logo-wrap">
        <img v-if="business.logoUrl" :src="business.logoUrl" :alt="business.name" class="logo" />
        <div v-else class="logo logo--placeholder">{{ business.name?.charAt(0) }}</div>
      </div>
    </div>

    <div class="info-row">
      <div class="info">
        <h1 class="name">{{ business.name }}</h1>
        <div v-if="business.category" class="meta">{{ business.category }}</div>
        <div v-if="business.address" class="address">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ business.address }}
        </div>
      </div>
      <button class="btn-book" @click="$emit('book')">Reservar</button>
    </div>

    <p v-if="business.description" class="description">{{ business.description }}</p>
  </div>
</template>

<script setup>
defineProps({
  business: { type: Object, required: true },
})
defineEmits(['book'])
</script>

<style scoped>
.business-header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); }
.cover {
  position: relative;
  height: 140px;
}
.cover-bg {
  position: absolute; inset: 0; overflow: hidden;
  background: linear-gradient(180deg, var(--color-surface-alt) 0%, var(--color-bg) 100%);
}
.cover-pattern {
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(135deg, rgba(63,225,255,0.05) 0px, rgba(63,225,255,0.05) 2px, transparent 2px, transparent 24px);
}
.logo-wrap { position: absolute; bottom: -32px; left: 24px; }
.logo { width: 76px; height: 76px; border-radius: 16px; border: 3px solid var(--color-surface); object-fit: cover; }
.logo--placeholder {
  display: flex; align-items: center; justify-content: center;
  background: var(--color-surface-alt); color: var(--neon); font-size: 1.8rem; font-weight: 600;
}
.info-row { padding: 44px 24px 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.name { color: var(--color-text); font-size: 1.4rem; font-weight: 600; margin: 0 0 4px; }
.meta { color: var(--neon-dim); font-size: 0.85rem; margin-bottom: 4px; }
.address { display: flex; align-items: center; gap: 6px; color: var(--color-text-muted); font-size: 0.85rem; }
.icon { width: 14px; height: 14px; flex-shrink: 0; }
.btn-book {
  background: var(--neon); color: var(--color-bg); border: none; font-weight: 600;
  padding: 11px 26px; border-radius: 10px; font-size: 0.9rem; cursor: pointer; white-space: nowrap;
}
.description { padding: 0 24px 16px; color: var(--color-text-muted); font-size: 0.88rem; margin: 0; }
</style>