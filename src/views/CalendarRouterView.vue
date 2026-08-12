<template>
  <ClientAgendaView v-if="isClient" />
  <AgendaView v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ClientAgendaView from '@/views/client/ClientAgendaView.vue'
import AgendaView from '@/views/dashboard/AgendaView.vue'

const authStore = useAuthStore()
const isClient = computed(() => authStore.profileType === 'CLIENT')
</script>