<!-- ============================================================
     SettingsView.vue — Panel de configuración (estilo ProDeel)
     ============================================================
     Sidebar de settings a la izquierda (usuario + navegación
     por grupos) y contenido a la derecha.
       - Dueño: Mis datos, Perfil del negocio, Contraseña, Equipo
       - Empleado / Cliente: Mis datos, Contraseña
     ============================================================ -->

<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1 class="settings-title">Configuración</h1>
      <button class="btn-back" @click="router.push('/calendario')">
        <span class="btn-back-icon" v-html="chevronLeftIcon"></span>
        Volver
      </button>
    </header>

    <div class="settings-layout">
      <aside class="settings-sidebar">
        <div class="settings-user-card">
          <span class="settings-avatar">{{ initials }}</span>
          <div class="settings-user-info">
            <div class="settings-user-name">{{ displayName }}</div>
            <div class="settings-user-email">{{ settingsStore.profile?.email || '—' }}</div>
          </div>
        </div>

        <nav aria-label="Secciones de configuración">
          <template v-for="group in navGroups" :key="group.label">
            <span class="settings-nav-group">{{ group.label }}</span>
            <button
              v-for="item in group.items"
              :key="item.key"
              type="button"
              class="settings-nav-item"
              :class="{ 'is-active': activeTab === item.key }"
              @click="activeTab = item.key"
            >
              <span
                class="settings-nav-icon"
                v-html="icons[item.icon]"
              ></span>
              {{ item.label }}
            </button>
          </template>
        </nav>
      </aside>

      <main class="settings-content">
        <div v-if="settingsStore.loading" class="settings-loading">
          <span class="spinner-border spinner-border-sm" role="status"></span>
          Cargando configuración...
        </div>

        <div v-else-if="settingsStore.error" class="settings-alert settings-alert-error">
          <span v-html="alertIcon"></span>
          <span>{{ settingsStore.error }}</span>
        </div>

        <template v-else>
          <h2 class="settings-content-title">{{ contentMeta[activeTab].title }}</h2>
          <p class="settings-content-subtitle">{{ contentMeta[activeTab].subtitle }}</p>

          <component :is="activeComponent" />
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
/**
 * SettingsView.vue
 * Panel de configuración con sidebar vertical.
 * Solo el dueño del negocio ve las secciones de negocio.
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { useSettingsStore } from '@/stores/settings'
import MyDetailsTab from '@/components/settings/MyDetailsTab.vue'
import ProfileTab from '@/components/settings/ProfileTab.vue'
import PlanTab from '@/components/settings/PlanTab.vue'
import PasswordTab from '@/components/settings/PasswordTab.vue'
import TeamTab from '@/components/settings/TeamTab.vue'

import chevronLeftIcon from '@/assets/images/icons/chevron-left.svg?raw'
import userIcon from '@/assets/images/icons/user.svg?raw'
import briefcaseIcon from '@/assets/images/icons/briefcase.svg?raw'
import creditCardIcon from '@/assets/images/icons/credit-card.svg?raw'
import lockIcon from '@/assets/images/icons/lock.svg?raw'
import usersIcon from '@/assets/images/icons/users.svg?raw'
import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const businessStore = useBusinessStore()
const settingsStore = useSettingsStore()

const validTabs = ['details', 'profile', 'plan', 'password', 'team']

const activeTab = ref(validTabs.includes(String(route.query.tab)) ? String(route.query.tab) : 'details')

watch(() => route.query.tab, (tab) => {
  if (validTabs.includes(String(tab))) activeTab.value = String(tab)
})

/** isOwner — Solo el dueño del negocio ve Perfil del negocio y Equipo */
const isOwner = computed(() => authStore.isBusiness && businessStore.hasBusiness)

const icons = {
  user: userIcon,
  briefcase: briefcaseIcon,
  card: creditCardIcon,
  lock: lockIcon,
  users: usersIcon,
}

/** activeComponent — Componente de la pestaña activa (los datos viven en el store) */
const activeComponent = computed(() => {
  const map = {
    details: MyDetailsTab,
    profile: ProfileTab,
    plan: PlanTab,
    password: PasswordTab,
    team: TeamTab,
  }
  return map[activeTab.value] || MyDetailsTab
})

const contentMeta = {
  details: { title: 'Mis datos', subtitle: 'Actualiza tu información personal' },
  password: { title: 'Contraseña', subtitle: 'Cambia la contraseña de acceso a tu cuenta' },
  profile: { title: 'Perfil del negocio', subtitle: 'Datos públicos de tu negocio' },
  plan: { title: 'Plan', subtitle: 'Plan y límites de tu negocio' },
  team: { title: 'Equipo', subtitle: 'Invita a empleados a trabajar en tu negocio' },
}

const navGroups = computed(() => {
  const groups = [
    {
      label: 'Cuenta',
      items: [
        { key: 'details', label: 'Mis datos', icon: 'user' },
        { key: 'password', label: 'Contraseña', icon: 'lock' },
      ],
    },
  ]
  if (isOwner.value) {
    groups.push({
      label: 'Negocio',
      items: [
        { key: 'profile', label: 'Perfil del negocio', icon: 'briefcase' },
        { key: 'plan', label: 'Plan', icon: 'card' },
        { key: 'team', label: 'Equipo', icon: 'users' },
      ],
    })
  }
  return groups
})

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

// Si la pestaña activa deja de existir (cambio de rol), se resetea
watch(navGroups, (groups) => {
  const keys = groups.flatMap((g) => g.items.map((i) => i.key))
  if (!keys.includes(activeTab.value)) activeTab.value = keys[0] || 'details'
})

onMounted(async () => {
  if (authStore.isBusiness && !businessStore.fetched) {
    await businessStore.fetchStatus().catch(() => {})
  }
  settingsStore.fetchAll(isOwner.value)
})
</script>
