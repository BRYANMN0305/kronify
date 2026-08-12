<!-- ============================================================
     PasswordTab.vue — Cambio de contraseña (todos los roles)
     ============================================================
     Valida la contraseña actual y aplica la nueva
     (PATCH /users/updatedPassword).
     ============================================================ -->

<template>
  <div class="settings-tab">
  <section class="settings-section">
    <div class="settings-section-header">
      <div>
        <h3 class="settings-section-title">Cambiar contraseña</h3>
        <p class="settings-section-subtitle">Usa al menos 8 caracteres para tu nueva contraseña</p>
      </div>
    </div>

    <form class="settings-form" novalidate @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label class="form-label" for="pwCurrent">Contraseña actual</label>
        <input
          id="pwCurrent"
          v-model="form.currentPassword"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': errors.currentPassword }"
          placeholder="Tu contraseña actual"
          autocomplete="current-password"
        />
        <div class="invalid-feedback">{{ errors.currentPassword }}</div>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label" for="pwNew">Nueva contraseña</label>
          <input
            id="pwNew"
            v-model="form.newPassword"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.newPassword }"
            placeholder="Nueva contraseña"
            autocomplete="new-password"
          />
          <div class="invalid-feedback">{{ errors.newPassword }}</div>
        </div>

        <div class="col-md-6">
          <label class="form-label" for="pwConfirm">Confirmar nueva contraseña</label>
          <input
            id="pwConfirm"
            v-model="form.confirmPassword"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.confirmPassword }"
            placeholder="Repite la nueva contraseña"
            autocomplete="new-password"
          />
          <div class="invalid-feedback">{{ errors.confirmPassword }}</div>
        </div>
      </div>

      <div class="d-flex gap-2 mt-4 settings-form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ saving ? 'Actualizando...' : 'Actualizar contraseña' }}
        </button>
      </div>

      <div v-if="error" class="settings-alert settings-alert-error">
        <span v-html="alertIcon"></span>
        <span>{{ error }}</span>
      </div>
    </form>
  </section>
  </div>
</template>

<script setup>
/**
 * PasswordTab.vue
 * Cambia la contraseña del usuario autenticado.
 */
import { reactive, ref } from 'vue'
import { userService } from '@/api/user'

import alertIcon from '@/assets/images/icons/alert-circle.svg?raw'

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const saving = ref(false)
const error = ref('')

const validate = () => {
  let ok = true
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  if (!form.currentPassword) {
    errors.currentPassword = 'Ingresa tu contraseña actual'
    ok = false
  }
  if (!form.newPassword) {
    errors.newPassword = 'La nueva contraseña es obligatoria'
    ok = false
  } else if (form.newPassword.length < 8) {
    errors.newPassword = 'Mínimo 8 caracteres'
    ok = false
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirma tu nueva contraseña'
    ok = false
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    ok = false
  }
  return ok
}

const handleSubmit = async () => {
  if (!validate()) return
  saving.value = true
  error.value = ''
  try {
    await userService.updatePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e) {
    error.value = e.message || 'Error al actualizar la contraseña'
  } finally {
    saving.value = false
  }
}
</script>
