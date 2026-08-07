<!-- ============================================================
     RegisterForm.vue — Formulario de registro de usuario
     ============================================================
     Renderizado dentro de AuthView.vue con animación slide.
     Emite "switch" para cambiar al formulario de login.
     ============================================================ -->

<template>
  <div>
    <h1 class="auth-title">Crear una cuenta</h1>
    <p class="auth-subtitle">Únete a Kronify y despega tu negocio</p>

    <form @submit.prevent="handleRegister" novalidate>

      <div class="row g-2 mb-2">
        <div class="col-6">
          <label for="name" class="form-label">Nombre</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
            placeholder="Nombre"
            required
          />
          <div class="invalid-feedback">{{ errors.name }}</div>
        </div>
        <div class="col-6">
          <label for="lastName" class="form-label">Apellido</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.lastName }"
            placeholder="Apellido"
            required
          />
          <div class="invalid-feedback">{{ errors.lastName }}</div>
        </div>
      </div>

      <div class="mb-2">
        <label for="phoneNumber" class="form-label">Teléfono</label>
        <input
          id="phoneNumber"
          v-model="form.phoneNumber"
          type="tel"
          class="form-control"
          :class="{ 'is-invalid': errors.phoneNumber }"
          placeholder="+57 3006217237"
        />
        <div class="invalid-feedback">{{ errors.phoneNumber }}</div>
      </div>

      <div class="mb-2">
        <label for="regEmail" class="form-label">Correo</label>
        <input
          id="regEmail"
          v-model="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
          placeholder="Correo electrónico"
          required
        />
        <div class="invalid-feedback">{{ errors.email }}</div>
      </div>

      <div class="mb-2">
        <label for="regPassword" class="form-label">Contraseña</label>
        <input
          id="regPassword"
          v-model="form.passwordHash"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': errors.passwordHash }"
          placeholder="Crea una contraseña segura"
          required
        />
        <div class="invalid-feedback">{{ errors.passwordHash }}</div>
      </div>

      <div class="mb-3">
        <ProfileTypeSelector v-model="form.profileType" />
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
      </button>

    </form>

    <div v-if="error" class="auth-error">{{ error }}</div>

    <div class="auth-divider my-2">o</div>

    <OAuthButtons @oauth="loginWithOAuth" :disabled="oauthRedirecting" />

    <p class="auth-footer-text text-center mt-3 mb-0">
      ¿Ya tienes una cuenta?
      <a href="#" class="auth-link" @click.prevent="$emit('switch')">Iniciar sesión</a>
    </p>
  </div>
</template>

<script setup>
/**
 * RegisterForm.vue
 * Formulario de registro de usuario.
 * @emits {void} switch - Cambia al formulario de login
 */
import { reactive } from 'vue'
import OAuthButtons from '@/components/auth/OAuthButtons.vue'
import ProfileTypeSelector from '@/components/auth/ProfileTypeSelector.vue'
import { useAuth } from '@/composables/useAuth'

defineEmits(['switch'])

const { register, loginWithOAuth, oauthRedirecting, loading, error } = useAuth()

const form = reactive({
  name: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  passwordHash: '',
  profileType: 'CLIENT',
})

const errors = reactive({
  name: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  passwordHash: '',
})

function validate() {
  let valido = true
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (!form.name) { errors.name = 'El nombre es obligatorio'; valido = false }
  if (!form.lastName) { errors.lastName = 'El apellido es obligatorio'; valido = false }
  if (!form.email) {
    errors.email = 'El correo es obligatorio'
    valido = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Formato de correo inválido'
    valido = false
  }
  if (!form.passwordHash) {
    errors.passwordHash = 'La contraseña es obligatoria'
    valido = false
  } else if (form.passwordHash.length < 6) {
    errors.passwordHash = 'Mínimo 6 caracteres'
    valido = false
  }
  return valido
}

async function handleRegister() {
  if (!validate()) return
  await register({ ...form })
}
</script>
