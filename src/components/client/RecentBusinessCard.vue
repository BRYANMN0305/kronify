<template>
  <button type="button" class="recent-card" @click="$emit('select', business)">
    <div class="recent-logo">
      <img v-if="business.logoUrl" :src="business.logoUrl" :alt="business.name" />
      <span v-else>{{ initial }}</span>
    </div>

    <div class="recent-body">
      <div class="recent-name">{{ business.name }}</div>
      <div class="recent-meta">
        <span v-if="business.category">{{ business.category }}</span>
        <span v-if="business.address">{{ business.address }}</span>
      </div>
      <div class="recent-last">Ultima cita: {{ lastVisit }}</div>
    </div>

    <div class="recent-action">
      <span class="recent-action-label">Volver a agendar</span>
      <span class="recent-action-arrow" v-html="arrowIcon"></span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  business: { type: Object, required: true },
})
defineEmits(['select'])

const arrowIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`

const initial = computed(() => String(props.business.name || 'N').charAt(0).toUpperCase())
const lastVisit = computed(() => {
  const date = props.business.lastAppointmentAt
  return date ? dayjs(date).format('DD MMM YYYY') : '—'
})
</script>

<style scoped>
.recent-card {
  align-items: center;
  background: linear-gradient(180deg, rgba(16, 37, 44, 0.92), rgba(10, 24, 30, 0.92));
  border: 1px solid rgba(213, 240, 247, 0.1);
  border-radius: 14px;
  color: var(--color-text);
  cursor: pointer;
  display: grid;
  gap: 14px;
  grid-template-columns: 54px minmax(0, 1fr) auto;
  min-width: 0;
  padding: 14px;
  text-align: left;
  transition: border-color 0.16s, transform 0.16s, box-shadow 0.16s;
  width: 100%;
}
.recent-card:hover {
  border-color: rgba(63, 225, 255, 0.45);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  transform: translateY(-1px);
}
.recent-logo {
  align-items: center;
  background: var(--color-surface-alt);
  border: 1px solid rgba(213, 240, 247, 0.12);
  border-radius: 12px;
  color: var(--neon);
  display: flex;
  flex-shrink: 0;
  font-size: 1.35rem;
  font-weight: 800;
  height: 54px;
  justify-content: center;
  overflow: hidden;
  width: 54px;
}
.recent-logo img { height: 100%; object-fit: cover; width: 100%; }
.recent-body { min-width: 0; }
.recent-name { font-size: 1rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.recent-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.recent-meta span {
  background: rgba(63, 225, 255, 0.1);
  border: 1px solid rgba(63, 225, 255, 0.14);
  border-radius: 999px;
  color: rgba(213, 240, 247, 0.7);
  font-size: 0.72rem;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  padding: 0.2rem 0.55rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.recent-last { color: rgba(213, 240, 247, 0.5); font-size: 0.78rem; margin-top: 6px; }
.recent-action {
  align-items: center;
  color: var(--neon);
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-content: center;
  min-width: 92px;
}
.recent-action-label { font-size: 0.74rem; font-weight: 800; }
.recent-action-arrow {
  align-items: center;
  background: rgba(63, 225, 255, 0.14);
  border-radius: 50%;
  display: flex;
  height: 30px;
  justify-content: center;
  width: 30px;
}
.recent-action-arrow :deep(svg) { height: 15px; width: 15px; }
@media (max-width: 560px) {
  .recent-card { grid-template-columns: 48px minmax(0, 1fr); }
  .recent-logo { height: 48px; width: 48px; }
  .recent-action { display: none; }
}
</style>