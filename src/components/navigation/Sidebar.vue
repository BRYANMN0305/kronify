<!-- ============================================================
     Sidebar.vue — Barra lateral fija de la app
     ============================================================
     - Logo Kronify + avatar usuario
     - Tarjeta del negocio (logo, nombre, categoría, link público)
     - Navegación: Home, Services, Settings
     - Card "Mejora a Pro" (solo si está en plan free) con uso del plan
     - Tarjeta de usuario al pie con chevron → dropdown con cerrar sesión
     ============================================================ -->

<template>
  <aside class="app-sidebar">
    <div class="sidebar-header">
      <span class="sidebar-logo">
        <img class="sidebar-logo-mark" :src="kronifyLogo" alt="Kronify" />
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
      <div v-if="sidebarBusiness" class="sidebar-business">
        <a
          class="sidebar-business-card"
          :href="publicUrl || undefined"
          target="_blank"
          rel="noopener noreferrer"
          :title="publicUrl || 'Página pública no disponible'"
        >
          <span class="sidebar-business-avatar">
            <img v-if="sidebarBusiness.logoUrl" :src="sidebarBusiness.logoUrl" alt="Logo del negocio" />
            <template v-else>{{ businessInitial }}</template>
          </span>
          <span class="sidebar-business-info">
            <span class="sidebar-business-name">{{ sidebarBusiness.name }}</span>
            <span class="sidebar-business-category">{{ sidebarBusiness.category }}</span>
          </span>
          <span v-if="publicUrl" class="sidebar-business-external" v-html="externalIcon"></span>
        </a>
      </div>

      <div v-if="showUpgradeCard" class="sidebar-upgrade">
        <div class="sidebar-upgrade-head">
          <span class="sidebar-upgrade-icon" v-html="upgradeIcon"></span>
          <span class="sidebar-upgrade-title">Mejora tu plan</span>
        </div>
        <p class="sidebar-upgrade-text">¿Tu negocio va en serio? Kronify también. Sin límites de servicios, citas ni empleados.</p>
        <div v-if="planUsage.length" class="sidebar-usage">
          <div v-for="item in planUsage" :key="item.label" class="usage-row">
            <div class="usage-row-head">
              <span>{{ item.label }}</span>
              <span>{{ item.text }}</span>
            </div>
            <div class="usage-bar">
              <span
                class="usage-bar-fill"
                :class="item.cls"
                :style="{ width: item.pct + '%' }"
              ></span>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-primary" @click="goToPlan">
          Actualizar plan
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
import { usePermissions } from '@/composables/usePermissions'

import kronifyLogo from '@/assets/images/icons/kronify_logo.png'
import homeIcon from '@/assets/images/icons/home.svg?raw'
import wrenchIcon from '@/assets/images/icons/wrench.svg?raw'
import clockIcon from '@/assets/images/icons/clock.svg?raw'
import settingsIcon from '@/assets/images/icons/settings.svg?raw'
import usersIcon from '@/assets/images/icons/users.svg?raw'
import logOutIcon from '@/assets/images/icons/log-out.svg?raw'
import sparklesIcon from '@/assets/images/icons/sparkles.svg?raw'
import chevronUpIcon from '@/assets/images/icons/chevron-up.svg?raw'
import upgradeIcon from '@/assets/images/icons/upgrade.svg?raw'
import externalIcon from '@/assets/images/icons/external-link.svg?raw'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { isOwner, canManageServices, canManageSchedules } = usePermissions()

const userMenuOpen = ref(true)

/** navItems — Solo las secciones a las que el usuario tiene permiso */
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
    items.push({ name: 'MisCitas', label: 'Mis citas', path: '/mis-citas', icon: clockIcon })
  }
  items.push({ name: 'Configuracion', label: 'Configuración', path: '/configuracion', icon: settingsIcon })
  return items
})

const isActive = (name) => route.name === name

/** sidebarBusiness — Datos del negocio para la tarjeta (solo dueño con negocio) */
const sidebarBusiness = computed(() => {
  const b = settingsStore.businessData
  if (!b?.name) return null
  return {
    name: b.name,
    category: b.category || 'Negocio',
    logoUrl: b.logoUrl || '',
  }
})

const businessInitial = computed(() => {
  const name = settingsStore.businessData?.name || ''
  return name.trim()?.[0]?.toUpperCase() || 'N'
})

/** publicUrl — URL pública del negocio (slug viene en los claims del JWT) */
const publicUrl = computed(() => {
  const slug = authStore.user?.slug
  return slug ? `${window.location.origin}/negocio/${slug}` : ''
})

/** planUsage — Barras de uso del plan para la card de upgrade */
const planUsage = computed(() => {
  const p = settingsStore.plan
  if (!p?.plan) return []
  const limits = p.plan || {}
  const items = [
    { label: 'Servicios', used: p.serviceCount, limit: limits.serviceLimit, reached: p.serviceLimitReached, exceeded: p.serviceLimitExceeded },
    { label: 'Citas del mes', used: p.currentMonthAppointmentCount, limit: limits.monthlyAppointmentLimit, reached: p.appointmentLimitReached, exceeded: p.appointmentLimitExceeded },
  ]
  return items
    .filter((it) => Number(it.limit) > 0)
    .map((it) => {
      const used = Number(it.used) || 0
      const limit = Number(it.limit)
      const pct = Math.min(100, Math.round((used / limit) * 100))
      let cls = 'usage-fill-normal'
      if (it.exceeded || it.reached || pct >= 100) cls = 'usage-fill-danger'
      else if (pct >= 75) cls = 'usage-fill-warning'
      return { label: it.label, text: `${used}/${limit}`, pct, cls }
    })
})

const navigate = (item) => {
  if (route.name !== item.name) router.push(item.path)
}

const handleLogout = () => {
  userMenuOpen.value = false
  authStore.logout()
  router.push({ name: 'IniciarSesion' })
}

const goToPlan = () => {
  router.push({ name: 'Configuracion', query: { tab: 'plan' } })
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

/** showUpgradeCard — Solo si el usuario es dueño del negocio y está en plan free */
const showUpgradeCard = computed(() => isOwner.value && isFreePlan.value)

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
