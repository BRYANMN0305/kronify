<template>
  <div class="dashboard-container">
    <h1>Calendario</h1>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const store = useAuthStore()
const router = useRouter()

const goToServices = () => {
  router.push({ name: 'Services' })
}

const goToSettings = () => {
  router.push({ name: 'Settings' })
}

const handleLogout = () => {
  store.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  color: var(--color-text);
  padding: 1.5rem;
}
</style>
