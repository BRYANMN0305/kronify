<!-- ============================================================
     MyDetailsTab.vue — Mis datos (todos los roles)
     ============================================================
     Secciones en solo lectura estilo ProDeel con botón "Editar":
       1. Mi perfil — avatar + nombre + correo + rol
       2. Información personal — nombre, apellido, teléfono, correo
       3. Métodos de autenticación — cuentas vinculadas
     ============================================================ -->

<template>
  <div class="settings-tab">
  <!-- Sección: Mi perfil -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Mi perfil</h3>
        <p class="settings-section-subtitle">Resumen de tu cuenta</p>
      </div>
    </div>

    <div class="settings-profile-header">
      <span class="settings-profile-avatar">{{ initials }}</span>
      <div>
        <p class="settings-profile-name">{{ fullName }}</p>
        <p class="settings-profile-meta">{{ profileRole }} &middot; {{ settingsStore.profile?.email || '—' }}</p>
      </div>
    </div>
  </section>

  <!-- Sección: Información personal -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Información personal</h3>
        <p class="settings-section-subtitle">Tus datos de identificación</p>
      </div>
      <button v-if="!editing" type="button" class="btn-edit" @click="startEdit">
        <span v-html="pencilIcon"></span>
        Editar
      </button>
      <button v-else type="button" class="btn-ghost" @click="cancelEdit">Cancelar</button>
    </div>

    <!-- Modo solo lectura -->
    <div v-if="!editing" class="settings-data-grid">
      <div>
        <div class="settings-data-label">Nombre</div>
        <div class="settings-data-value">{{ settingsStore.profile?.name || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">Apellido</div>
        <div class="settings-data-value">{{ settingsStore.profile?.lastName || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">Teléfono</div>
        <div class="settings-data-value">{{ settingsStore.profile?.phoneNumber || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">Correo electrónico</div>
        <div class="settings-data-value">{{ settingsStore.profile?.email || '—' }}</div>
      </div>
      <div>
        <div class="settings-data-label">Miembro desde</div>
        <div class="settings-data-value">{{ formatDate(settingsStore.profile?.createdAt) }}</div>
      </div>
      <div>
        <div class="settings-data-label">Última actualización</div>
        <div class="settings-data-value">{{ formatDate(settingsStore.profile?.updatedAt) }}</div>
      </div>
    </div>

    <!-- Modo edición -->
    <form v-else class="settings-form" novalidate @submit.prevent="handleSubmit">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label" for="mdName">Nombre</label>
          <input
            id="mdName"
            v-model="form.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            placeholder="Nombre"
          />
          <div class="invalid-feedback">{{ errors.name }}</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="mdLastName">Apellido</label>
          <input
            id="mdLastName"
            v-model="form.lastName"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.lastName }"
            placeholder="Apellido"
          />
          <div class="invalid-feedback">{{ errors.lastName }}</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="mdPhone">Teléfono</label>
          <input
            id="mdPhone"
            v-model="form.phoneNumber"
            type="tel"
            class="form-control"
            placeholder="+57 3006217237"
          />
        </div>

        <div class="col-md-6">
          <label class="form-label" for="mdEmail">Correo electrónico</label>
          <input
            id="mdEmail"
            :value="settingsStore.profile?.email || ''"
            type="email"
            class="form-control"
            disabled
          />
          <div class="field-hint">El correo no se puede cambiar.</div>
        </div>
      </div>

      <div class="d-flex gap-2 mt-4 settings-form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        <button type="button" class="btn-ghost" @click="cancelEdit">Cancelar</button>
      </div>

      <div v-if="error" class="settings-alert settings-alert-error">
        <span v-html="alertIcon"></span>
        <span>{{ error }}</span>
      </div>
    </form>
  </section>

  <!-- Sección: Métodos de autenticación -->
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Métodos de autenticación</h3>
        <p class="settings-section-subtitle">Formas en las que inicias sesión en tu cuenta</p>
      </div>
    </div>

    <div v-if="settingsStore.authMethods.length === 0" class="settings-empty">
      No hay métodos de autenticación registrados.
    </div>

    <ul v-else class="auth-methods-list">
      <li v-for="(m, i) in settingsStore.authMethods" :key="i" class="auth-method-item">
        <span class="auth-method-icon">
          <img v-if="methodIcon(m) === 'google'" src="@/assets/images/auth/google.svg" alt="Google" />
          <img v-else-if="methodIcon(m) === 'microsoft'" src="@/assets/images/auth/microsoft.svg" alt="Microsoft" />
          <span v-else v-html="mailIcon"></span>
        </span>
        <span class="auth-method-provider">{{ m.provider || m.type }}</span>
        <span class="auth-method-type">{{ m.type }}</span>
        <span class="auth-method-email">{{ m.email }}</span>
        <span class="auth-method-date">{{ formatDate(m.linkedAt) }}</span>
      </li>
    </ul>
  </section>

  <!-- Sección: Cerrar sesión (solo mobile; en desktop está en el sidebar) -->
  <section class="settings-section settings-logout-mobile">
    <button type="button" class="settings-logout-btn" @click="handleLogout">
      <span class="settings-logout-icon" v-html="logOutIcon"></span>
      Cerrar sesión
    </button>
  </section>
  </div>
</template>

<script setup>
/**
 * MyDetailsTab.vue
 * Datos personales del usuario en solo lectura con modo edición.
 */
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'
import { useSettingsStore } from '@/stores/settings'
import { userService } from '@/api/user'

import pencilIcon from '@/assets/images/icons/pencil.svg?raw'
import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'
import mailIcon from '@/assets/images/icons/mail.svg?raw'
import logOutIcon from '@/assets/images/icons/log-out.svg?raw'

const router = useRouter()
const authStore = useAuthStore()
const businessStore = useBusinessStore()
const settingsStore = useSettingsStore()

const form = reactive({
  name: '',
  lastName: '',
  phoneNumber: '',
})

const errors = reactive({ name: '', lastName: '' })
const editing = ref(false)
const saving = ref(false)
const error = ref('')

const initials = computed(() => {
  const p = settingsStore.profile
  const first = (p?.name || '')?.trim()?.[0] || ''
  const last = (p?.lastName || '')?.trim()?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

const fullName = computed(() => {
  const p = settingsStore.profile
  const name = [p?.name, p?.lastName].filter(Boolean).join(' ').trim()
  return name || 'Usuario'
})

const profileRole = computed(() => {
  if (authStore.isBusiness && businessStore.hasBusiness) return 'Dueño del negocio'
  if (authStore.isBusiness) return 'Empleado'
  return 'Cliente'
})

const fillForm = () => {
  const p = settingsStore.profile
  if (!p) return
  form.name = p.name || ''
  form.lastName = p.lastName || ''
  form.phoneNumber = p.phoneNumber || ''
}

watch(
  () => settingsStore.profile,
  (p) => {
    if (!editing.value) fillForm()
  },
  { immediate: true }
)

const formatDate = (value) => (value ? dayjs(value).format('DD MMM YYYY') : '—')

/** methodIcon — Devuelve el proveedor (google/microsoft) o null para icono genérico */
const methodIcon = (m) => {
  const key = `${m.provider || ''} ${m.type || ''}`.toLowerCase()
  if (key.includes('google')) return 'google'
  if (key.includes('microsoft')) return 'microsoft'
  return null
}

const startEdit = () => {
  fillForm()
  error.value = ''
  editing.value = true
}

const cancelEdit = () => {
  editing.value = false
  error.value = ''
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

const validate = () => {
  let ok = true
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  if (!form.name.trim()) {
    errors.name = 'El nombre es obligatorio'
    ok = false
  }
  if (!form.lastName.trim()) {
    errors.lastName = 'El apellido es obligatorio'
    ok = false
  }
  return ok
}

const handleSubmit = async () => {
  if (!validate()) return
  saving.value = true
  error.value = ''
  try {
    const payload = {
      name: form.name.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber.trim(),
    }
    const updated = await userService.updateProfile(payload)
    settingsStore.profile = { ...settingsStore.profile, ...updated }
    editing.value = false
  } catch (e) {
    error.value = e.message || 'Error al guardar los cambios'
  } finally {
    saving.value = false
  }
}

/** handleLogout — Cierra la sesión y vuelve a /iniciar-sesion (solo mobile) */
const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'IniciarSesion' })
}
</script>

<style scoped>
/* Cerrar sesión: oculto en desktop (el sidebar ya lo ofrece) */
.settings-logout-mobile {
  display: none;
}

.settings-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: rgba(255, 138, 138, 0.85);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.settings-logout-btn:hover {
  color: #ff8a8a;
  background: rgba(255, 107, 107, 0.08);
  border-color: rgba(255, 107, 107, 0.35);
}

.settings-logout-icon {
  display: inline-flex;
}

.settings-logout-icon svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .settings-logout-mobile {
    display: block;
  }
}
</style>
