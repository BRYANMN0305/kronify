<!-- ============================================================
     LoginForm.vue — Formulario de inicio de sesión
     ============================================================
     Renderizado dentro de AuthView.vue con animación slide.
     Emite "switch" para cambiar al formulario de registro.
     ============================================================ -->

<template>
  <div>
    <h1 class="auth-title">Bienvenido de vuelta</h1>
    <p class="auth-subtitle">Inicia sesión en tu cuenta de Kronify</p>

    <form @submit.prevent="handleLogin" novalidate>

      <div class="mb-3">
        <label for="email" class="form-label">Correo</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
          placeholder="Correo electrónico"
          required
        />
        <div class="invalid-feedback">{{ errors.email }}</div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': errors.password }"
          placeholder="Ingresa tu contraseña"
          required
        />
        <div class="invalid-feedback">{{ errors.password }}</div>
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>

    </form>

    <div v-if="error" class="auth-error">{{ error }}</div>

    <div class="auth-divider my-2">o</div>

    <OAuthButtons @oauth="loginWithOAuth" :disabled="oauthRedirecting" />

    <p class="auth-footer-text text-center mt-3 mb-0">
      ¿No tienes una cuenta?
      <a href="#" class="auth-link" @click.prevent="$emit('switch')">Registrarme</a>
    </p>
  </div>
</template>

<script setup>
/**
 * LoginForm.vue
 * Formulario de inicio de sesión.
 * @emits {void} switch - Cambia al formulario de registro
 */
import { reactive } from 'vue'
import OAuthButtons from '@/components/auth/OAuthButtons.vue'
import { useAuth } from '@/composables/useAuth'

defineEmits(['switch'])

const { login, loginWithOAuth, oauthRedirecting, loading, error } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function validate() {
  let valido = true
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'El correo es obligatorio'
    valido = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Formato de correo inválido'
    valido = false
  }
  if (!form.password) {
    errors.password = 'La contraseña es obligatoria'
    valido = false
  }
  return valido
}

async function handleLogin() {
  if (!validate()) return
  await login({ email: form.email, password: form.password })
}
</script>
