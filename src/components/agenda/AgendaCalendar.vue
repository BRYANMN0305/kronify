<template>
  <div class="agenda-list">
    <button
      v-for="appointment in appointments"
      :key="appointment.appointmentId"
      type="button"
      class="agenda-item"
      @click="$emit('select', appointment)"
    >
      <div class="agenda-time">
        <span>{{ formatDate(appointment.startAt) }}</span>
        <strong>{{ formatTime(appointment.startAt) }}</strong>
      </div>
      <div class="agenda-main">
        <div class="agenda-title">{{ appointment.serviceName }}</div>
        <div class="agenda-meta">
          <span>{{ appointment.customerName || 'Cliente sin nombre' }}</span>
          <span>{{ appointment.employeeName }}</span>
          <span>{{ originLabel(appointment.origin) }}</span>
        </div>
      </div>
      <AppointmentStatusBadge :status="appointment.status" />
    </button>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import AppointmentStatusBadge from './AppointmentStatusBadge.vue'

defineProps({
  appointments: { type: Array, default: () => [] },
})
defineEmits(['select'])

const formatTime = (date) => dayjs(date).format('h:mm A')
const formatDate = (date) => dayjs(date).format('DD MMM')
const originLabel = (origin) => ({ PUBLIC: 'Publica', PRIVATE: 'Negocio', ADMIN: 'Admin' }[origin] || origin)
</script>

<style scoped>
.agenda-list { display: flex; flex-direction: column; gap: 10px; }
.agenda-item { align-items: center; background: rgba(16, 37, 44, 0.8); border: 1px solid rgba(213, 240, 247, 0.1); border-radius: 8px; color: var(--color-text); cursor: pointer; display: grid; gap: 16px; grid-template-columns: 92px 1fr auto; padding: 14px; text-align: left; transition: border-color 0.15s, background 0.15s; }
.agenda-item:hover { border-color: var(--neon); }
.agenda-time { border-right: 1px solid rgba(213, 240, 247, 0.1); display: flex; flex-direction: column; gap: 3px; }
.agenda-time span { color: rgba(213, 240, 247, 0.55); font-size: 0.76rem; font-weight: 700; text-transform: uppercase; }
.agenda-time strong { color: var(--neon); font-size: 1rem; }
.agenda-title { font-weight: 800; margin-bottom: 5px; }
.agenda-meta { color: rgba(213, 240, 247, 0.62); display: flex; flex-wrap: wrap; font-size: 0.82rem; gap: 8px; }
.agenda-meta span + span::before { color: rgba(213, 240, 247, 0.32); content: '•'; margin-right: 8px; }
@media (max-width: 640px) { .agenda-item { grid-template-columns: 1fr; } }
</style>
