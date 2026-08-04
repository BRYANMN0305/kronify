<!-- ============================================================
     Sidebar.vue — Barra lateral fija de la app
     ============================================================
     - Logo Workly (gear icon + texto) + avatar usuario
     - Navegación: Home, Services, Settings
     - Card "Mejora a Pro" (solo si está en plan free)
     - Tarjeta de usuario al pie con chevron → dropdown con cerrar sesión
     ============================================================ -->

<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">
        <span class="sidebar-logo-mark" v-html="gearIcon"></span>
        <span class="sidebar-logo-text">Kronify</span>
      </span>
    </div>

    <hr class="sidebar-divider">

    <nav class="sidebar-nav" aria-label="Navegación principal">
      <button
        v-for="item in navItems"
        :key="item.name"
        type="button"
        class="sidebar-nav-item"
        :class="{ 'is-active': isActive(item.name) }"
        @click="navigate(item)"
      >
        <span class="sidebar-nav-icon" v-html="item.icon"></span>
        <span class="sidebar-nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div v-if="showUpgradeCard" class="sidebar-upgrade">
        <div class="sidebar-upgrade-head">
          <span class="sidebar-upgrade-icon" v-html="upgradeIcon"></span>
          <span class="sidebar-upgrade-title">Mejora tu plan</span>
        </div>
        <p class="sidebar-upgrade-text">Desbloquea funciones avanzadas, reportes y herramientas que ahorran horas.</p>
        <button type="button" class="btn btn-primary" @click="goToPlan">
          Actualizar a Pro
        </button>
      </div>

      <div class="sidebar-user-section">
        <div class="sidebar-user-card">
          <span class="sidebar-avatar">{{ initials }}</span>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ displayName }}</div>
            <div class="sidebar-user-email">{{ displayEmail }}</div>
          </div>
          <button
            type="button"
            class="sidebar-user-toggle"
            :class="{ 'is-open': userMenuOpen }"
            aria-label="Expandir perfil"
            @click="userMenuOpen = !userMenuOpen"
          >
            <span v-html="chevronUpIcon"></span>
          </button>
        </div>

        <transition name="menu-slide">
          <div v-if="userMenuOpen" class="sidebar-user-menu">
            <button type="button" class="sidebar-menu-item sidebar-menu-logout" @click="handleLogout">
              <span class="sidebar-menu-icon" v-html="logOutIcon"></span>
              Cerrar sesión
            </button>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup>
/**
 * Sidebar.vue
 * Barra lateral fija para todas las vistas autenticadas.
 * En mobile se oculta (CSS) y se muestra BottomNav en su lugar.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

import gearIcon from '@/assets/images/icons/gear.svg?raw'
import homeIcon from '@/assets/images/icons/home.svg?raw'
import wrenchIcon from '@/assets/images/icons/wrench.svg?raw'
import settingsIcon from '@/assets/images/icons/settings.svg?raw'
import logOutIcon from '@/assets/images/icons/log-out.svg?raw'
import sparklesIcon from '@/assets/images/icons/sparkles.svg?raw'
import chevronUpIcon from '@/assets/images/icons/chevron-up.svg?raw'
import upgradeIcon from '@/assets/images/icons/upgrade.svg?raw'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const userMenuOpen = ref(false)

const navItems = [
  { name: 'Dashboard', label: 'Calendario', path: '/dashboard', icon: homeIcon },
  { name: 'Services', label: 'Servicios', path: '/servicios', icon: wrenchIcon },
  { name: 'Settings', label: 'Configuración', path: '/settings', icon: settingsIcon },
]

const isActive = (name) => route.name === name

const navigate = (item) => {
  if (route.name !== item.name) router.push(item.path)
}

const handleLogout = () => {
  userMenuOpen.value = false
  authStore.logout()
  router.push({ name: 'Login' })
}

const goToPlan = () => {
  router.push({ name: 'Settings', query: { tab: 'plan' } })
}

const closeMenu = (e) => {
  if (!e.target.closest('.sidebar-user-section')) {
    userMenuOpen.value = false
  }
}

const initials = computed(() => {
  const p = settingsStore.profile
  const first = (p?.name || '')?.trim()?.[0] || ''
  const last = (p?.lastName || '')?.trim()?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

const displayName = computed(() => {
  const p = settingsStore.profile
  const name = [p?.name, p?.lastName].filter(Boolean).join(' ').trim()
  return name || authStore.user?.name || 'Usuario'
})

const displayEmail = computed(() => settingsStore.profile?.email || '—')

/** isFreePlan — Detecta si el plan actual es free/gratis */
const isFreePlan = computed(() => {
  const plan = settingsStore.plan
  if (!plan?.plan) return false
  const name = String(plan.plan.displayName || plan.plan.name || '').toLowerCase()
  const status = String(plan.subscriptionStatus || '').toUpperCase()
  const freeNames = ['free', 'gratis', 'gratuito', 'basico', 'básico', 'basic']
  return freeNames.some((k) => name.includes(k)) || ['TRIAL', 'EXPIRED', 'CANCELLED'].includes(status)
})

/** showUpgradeCard — Solo si el usuario es dueño de negocio y está en plan free */
const showUpgradeCard = computed(() => authStore.isBusiness && isFreePlan.value)

onMounted(() => {
  if (!settingsStore.loaded.profile) {
    settingsStore.fetchAll(authStore.isBusiness).catch(() => {})
  }
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>
