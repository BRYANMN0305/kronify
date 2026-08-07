<!-- ============================================================
     OAuthCallbackView.vue — Callback del login con Google/Microsoft
     ============================================================
     Recibe el JWT propio en la URL (?token=...) y lo guarda.
     - Usuario existente  -> redirige al Calendario
     - Usuario nuevo      -> muestra el selector de tipo de perfil
     - Error del proveedor -> muestra el mensaje con volver al login
     El token se limpia del URL con history.replaceState para que no
     quede en el historial del navegador.
     ============================================================ -->

<template>
  <AuthLayout>
    <!-- Error al autenticar -->
    <div v-if="error">
      <h1 class="auth-title">Algo salió mal</h1>
      <p class="auth-subtitle">{{ error }}</p>
      <button type="button" class="btn btn-primary w-100" @click="goLogin">
        Volver al inicio de sesión
      </button>
    </div>

    <!-- Procesando la respuesta del proveedor -->
    <div v-else-if="processing" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="auth-subtitle mt-3">Procesando tu inicio de sesión...</p>
    </div>

    <!-- Primer login OAuth: elegir tipo de perfil -->
    <template v-else>
      <h1 class="auth-title">Casi listo</h1>
      <p class="auth-subtitle">¿Cómo querés usar Kronify?</p>

      <form @submit.prevent="handleSubmitProfile" novalidate>
        <div class="mb-3">
          <ProfileTypeSelector v-model="profileType" />
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="savingProfile">
          <span v-if="savingProfile" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ savingProfile ? 'Guardando...' : 'Continuar' }}
        </button>

        <div v-if="profileError" class="auth-error">{{ profileError }}</div>
      </form>
    </template>
  </AuthLayout>
</template>

<script setup>
/**
 * OAuthCallbackView.vue
 * Procesa el callback OAuth devuelto por el backend y finaliza la sesión.
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ProfileTypeSelector from '@/components/auth/ProfileTypeSelector.vue'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { finalizeOAuthLogin, completeOAuthProfile } = useAuth()
const { setAuth } = useAuthStore()

const error = ref('')
const processing = ref(true)
const profileType = ref('CLIENT')
const savingProfile = ref(false)
const profileError = ref('')

/** goLogin — Vuelve a la pantalla de inicio de sesión */
const goLogin = () => router.replace({ name: 'IniciarSesion' })

/** handleSubmitProfile — Guarda el perfil y entra a la app con el token actualizado */
const handleSubmitProfile = async () => {
  if (!profileType.value) return
  savingProfile.value = true
  profileError.value = ''
  try {
    await completeOAuthProfile(profileType.value)
  } catch (e) {
    profileError.value = e?.message || 'No se pudo guardar tu perfil'
    savingProfile.value = false
  }
}

onMounted(() => {
  const { token, newProfile, error: oauthError } = route.query

  // Limpia el token del URL para que no quede en el historial
  history.replaceState(null, '', window.location.pathname)

  if (oauthError) {
    error.value = 'No se pudo iniciar sesión con el proveedor. Intentá nuevamente.'
    processing.value = false
    return
  }

  if (!token) {
    error.value = 'Respuesta de autenticación inválida.'
    processing.value = false
    return
  }

  if (newProfile === 'true') {
    // Guarda el token provisional y pide el tipo de perfil (sin redirigir aún)
    setAuth({ token })
    processing.value = false
    return
  }

  finalizeOAuthLogin(token)
})
</script>