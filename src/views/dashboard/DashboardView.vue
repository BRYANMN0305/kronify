<template>
  <div class="dashboard-container">
    <h1>Panel de control</h1>
    <p>Bienvenido, {{ store.user?.name || 'Usuario' }}</p>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-light" @click="goToServices">Servicios</button>
      <button class="btn btn-outline-light" @click="goToSettings">Configuración</button>
      <button class="btn btn-outline-danger" @click="handleLogout">Cerrar Sesión</button>
    </div>
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
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  padding: 2rem;
}
</style>
