<!-- ============================================================
     BottomNav.vue — Barra de navegación inferior (mobile)
     ============================================================
     Visible solo en pantallas <= 768px (CSS).
     Muestra los mismos items de navegación que el sidebar,
     filtrados por los permisos del usuario.
     ============================================================ -->

<template>
  <nav class="app-bottom-nav" aria-label="Navegación inferior">
    <button
      v-for="item in navItems"
      :key="item.name"
      type="button"
      class="bottom-nav-item"
      :class="{ 'is-active': isActive(item.name) }"
      @click="navigate(item)"
    >
      <span class="bottom-nav-icon" v-html="item.icon"></span>
      <span class="bottom-nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup>
/**
 * BottomNav.vue
 * Barra inferior fija para mobile. Reemplaza al sidebar en pantallas pequeñas.
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth'

import homeIcon from '@/assets/images/icons/home.svg?raw'
import wrenchIcon from '@/assets/images/icons/wrench.svg?raw'
import clockIcon from '@/assets/images/icons/clock.svg?raw'
import settingsIcon from '@/assets/images/icons/settings.svg?raw'
import usersIcon from '@/assets/images/icons/users.svg?raw'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { canManageServices, canManageSchedules } = usePermissions()

const navItems = computed(() => {
  const items = [
    { name: 'Calendario', label: 'Calendario', path: '/calendario', icon: homeIcon },
  ]
  if (canManageSchedules.value) {
    items.push({ name: 'Horarios', label: 'Horarios', path: '/horarios', icon: clockIcon })
  }
  if (canManageServices.value) {
    items.push({ name: 'Servicios', label: 'Servicios', path: '/servicios', icon: wrenchIcon })
    items.push({ name: 'Resenas', label: 'Reseñas', path: '/resenas', icon: usersIcon })
  }
  if (!authStore.isBusiness) {
    items.push({ name: 'NegociosRecientes', label: 'Negocios recientes', path: '/negocios-recientes', icon: clockIcon })
  }
  items.push({ name: 'Configuracion', label: 'Configuración', path: '/configuracion', icon: settingsIcon })
  return items
})

const isActive = (name) => route.name === name

const navigate = (item) => {
  if (route.name !== item.name) router.push(item.path)
}
</script>
