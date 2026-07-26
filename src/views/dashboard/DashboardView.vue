<template>
  <div class="dashboard-container">
    <h1>Panel de control</h1>
    <p>Bienvenido, {{ store.user?.name || 'Usuario' }}</p>
    <button class="btn btn-outline-light" @click="handleLogout">Cerrar Sesión</button>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const store = useAuthStore()
const router = useRouter()

function handleLogout() {
  store.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  padding: 2rem;
}
</style>
