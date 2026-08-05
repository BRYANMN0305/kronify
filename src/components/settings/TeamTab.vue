<!-- ============================================================
     TeamTab.vue — Gestión de invitaciones del negocio (solo dueño)
     ============================================================
     CRUD de invitaciones:
       - GET  /business/invitations/          listar
       - POST /business/invitations/          crear
       - POST /business/invitation/{id}/resend  reenviar (PENDING)
       - POST /business/invitation/{id}/cancel  cancelar (PENDING)
     ============================================================ -->

<template>
  <div class="settings-tab">
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Equipo</h3>
        <p class="settings-section-subtitle">Invita a empleados a trabajar en tu negocio</p>
      </div>

      <button
        v-if="showForm"
        type="button"
        class="btn-ghost"
        @click="showForm = false"
      >
        Cerrar
      </button>
      <button v-else type="button" class="btn btn-primary text-nowrap" @click="showForm = true">
        Invitar miembro
      </button>
    </div>

    <form
      v-if="showForm"
      class="settings-form invite-form"
      novalidate
      @submit.prevent="handleCreate"
    >
      <div class="d-flex gap-2 align-items-start invite-row">
        <div class="flex-grow-1">
          <input
            v-model="inviteEmail"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': inviteErrors.email }"
            placeholder="correo@empleado.com"
          />
          <div class="invalid-feedback">{{ inviteErrors.email }}</div>
        </div>
        <button type="submit" class="btn btn-primary text-nowrap" :disabled="creating">
          <span v-if="creating" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Enviar invitación
        </button>
      </div>
    </form>

    <div v-if="success" class="settings-alert settings-alert-success">
      <span v-html="checkIcon"></span>
      <span>{{ success }}</span>
    </div>

    <div v-if="error" class="settings-alert settings-alert-error">
      <span v-html="alertIcon"></span>
      <span>{{ error }}</span>
    </div>

    <div v-if="settingsStore.invitations.length === 0" class="settings-empty">
      Aún no has invitado a nadie.
    </div>

    <div v-else class="invitations-table">
      <div class="invitations-row invitations-head">
        <span>Correo</span>
        <span>Estado</span>
        <span>Expira</span>
        <span>Creada</span>
        <span></span>
      </div>

      <div v-for="inv in settingsStore.invitations" :key="inv.invitationId" class="invitations-row">
        <span class="inv-email">{{ inv.email }}</span>
        <span>
          <span class="status-badge" :class="statusMeta[inv.status]?.cls || 'status-default'">
            {{ statusMeta[inv.status]?.label || inv.status }}
          </span>
        </span>
        <span class="inv-date">{{ formatDate(inv.expiresAt) }}</span>
        <span class="inv-date">{{ formatDate(inv.createdAt) }}</span>
        <span class="inv-actions">
          <button
            v-if="inv.status === 'PENDING'"
            type="button"
            class="btn-action"
            :disabled="busyId === inv.invitationId"
            @click="handleResend(inv)"
          >
            Reenviar
          </button>
          <button
            v-if="inv.status === 'PENDING'"
            type="button"
            class="btn-action btn-action-danger"
            :disabled="busyId === inv.invitationId"
            @click="handleCancel(inv)"
          >
            Cancelar
          </button>
        </span>
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
/**
 * TeamTab.vue
 * Solo se renderiza cuando el usuario es dueño del negocio (isOwner).
 */
import { ref, reactive, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useSettingsStore } from '@/stores/settings'
import { invitationService } from '@/api/invitation'

import checkIcon from '@/assets/images/icons/check.svg?raw'
import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'

const settingsStore = useSettingsStore()

/** Al abrir la pestaña, revalida en silencio (aceptaciones hechas fuera) */
onMounted(() => {
  if (settingsStore.loaded.invitations) {
    settingsStore.fetchInvitations().catch(() => {})
  }
})

const showForm = ref(false)
const inviteEmail = ref('')
const inviteErrors = reactive({ email: '' })
const creating = ref(false)
const busyId = ref(null)
const success = ref('')
const error = ref('')

const statusMeta = {
  PENDING: { label: 'Pendiente', cls: 'status-pending' },
  ACCEPTED: { label: 'Aceptada', cls: 'status-accepted' },
  CANCELLED: { label: 'Cancelada', cls: 'status-cancelled' },
  EXPIRED: { label: 'Expirada', cls: 'status-expired' },
}

const formatDate = (value) => (value ? dayjs(value).format('DD MMM YYYY') : '—')

const refresh = async () => {
  await settingsStore.fetchInvitations()
}

const handleCreate = async () => {
  inviteErrors.email = ''
  const email = inviteEmail.value.trim()
  if (!email) {
    inviteErrors.email = 'El correo es obligatorio'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    inviteErrors.email = 'Formato de correo inválido'
    return
  }
  creating.value = true
  success.value = ''
  error.value = ''
  try {
    await invitationService.create(email)
    inviteEmail.value = ''
    showForm.value = false
    await refresh()
    success.value = 'Invitación enviada correctamente'
  } catch (e) {
    error.value = e.message || 'Error al enviar la invitación'
  } finally {
    creating.value = false
  }
}

const handleResend = async (inv) => {
  busyId.value = inv.invitationId
  success.value = ''
  error.value = ''
  try {
    await invitationService.resend(inv.invitationId)
    await refresh()
    success.value = 'Invitación reenviada correctamente'
  } catch (e) {
    error.value = e.message || 'Error al reenviar la invitación'
  } finally {
    busyId.value = null
  }
}

const handleCancel = async (inv) => {
  busyId.value = inv.invitationId
  success.value = ''
  error.value = ''
  try {
    await invitationService.cancel(inv.invitationId)
    await refresh()
    success.value = 'Invitación cancelada'
  } catch (e) {
    error.value = e.message || 'Error al cancelar la invitación'
  } finally {
    busyId.value = null
  }
}
</script>
