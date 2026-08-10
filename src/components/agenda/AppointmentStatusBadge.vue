<template>
  <span class="status-badge" :class="`status-${status}`">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const label = computed(() => ({
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  NO_SHOW: 'No asistio',
}[props.status] || props.status))
</script>

<style scoped>
.status-badge { border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-text-label); display: inline-flex; font-size: 0.75rem; font-weight: 700; padding: 0.22rem 0.55rem; }
.status-PENDING { background: rgba(63, 225, 255, 0.12); border-color: rgba(63, 225, 255, 0.35); }
.status-CONFIRMED { background: rgba(68, 196, 125, 0.15); border-color: rgba(68, 196, 125, 0.35); }
.status-CANCELLED, .status-NO_SHOW { background: rgba(255, 107, 107, 0.14); border-color: rgba(255, 107, 107, 0.32); }
.status-COMPLETED { background: rgba(213, 240, 247, 0.12); border-color: rgba(213, 240, 247, 0.28); }
</style>
