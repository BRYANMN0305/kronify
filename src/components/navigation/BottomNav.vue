<!-- ============================================================
     BottomNav.vue — Barra de navegación inferior (mobile)
     ============================================================
     Visible solo en pantallas <= 768px (CSS).
     Muestra los mismos items de navegación que el sidebar.
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
import { useRoute, useRouter } from 'vue-router'

import homeIcon from '@/assets/images/icons/home.svg?raw'
import wrenchIcon from '@/assets/images/icons/wrench.svg?raw'
import settingsIcon from '@/assets/images/icons/settings.svg?raw'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'Dashboard', label: 'Home', path: '/dashboard', icon: homeIcon },
  { name: 'Services', label: 'Services', path: '/servicios', icon: wrenchIcon },
  { name: 'Settings', label: 'Settings', path: '/settings', icon: settingsIcon },
]

const isActive = (name) => route.name === name

const navigate = (item) => {
  if (route.name !== item.name) router.push(item.path)
}
</script>
